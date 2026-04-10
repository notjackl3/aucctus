"""Document upload + ingestion endpoints."""

import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File, Form

from app.api.schemas import DocumentResponse, UploadDocumentResponse
from app.config import MAX_DOCUMENTS_PER_COMPANY, MAX_CHUNKS_PER_DOCUMENT, use_real_apis
from app.domain.enums import OperationStatus
from app.ingestion.document_processor import process_document, generate_section_summaries
from app.persistence import repositories as repo
from app.retrieval import retriever
from app.services import llm
from app.shared.utils import utc_now
from app.api.routes.companies import _generate_and_persist_suggestions

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """Extract text from an uploaded file (PDF, TXT, etc.) without ingesting it."""
    content = await file.read()
    content_type = file.content_type or "text/plain"
    result = process_document(content, content_type, file.filename or "unnamed")
    return {"text": result.raw_text, "filename": file.filename or "unnamed"}


@router.post("", response_model=UploadDocumentResponse, status_code=201)
async def upload_document(
    company_id: str = Form(...),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
):
    """Upload a document for a company."""
    company = await repo.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    existing = await repo.get_documents_for_company(company_id)
    if len(existing) >= MAX_DOCUMENTS_PER_COMPANY:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_DOCUMENTS_PER_COMPANY} documents per company")

    content = await file.read()
    content_type = file.content_type or "text/plain"
    filename = file.filename or "unnamed"

    # Section-aware processing
    processed = process_document(content, content_type, filename)

    doc = await repo.create_document(company_id, filename, content_type, processed.raw_text)
    operation = await repo.create_operation("document_ingest", parent_id=company_id, steps_total=4)

    background_tasks.add_task(_ingest_document, doc.id, processed, operation.id, company_id)
    if use_real_apis():
        background_tasks.add_task(_generate_and_persist_suggestions, company_id, company.name, company.context)

    return UploadDocumentResponse(document_id=doc.id, operation_id=operation.id, status="pending")


@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: str):
    """Delete a document and all associated chunks, sections, and embeddings."""
    deleted = await repo.delete_document(document_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")


@router.get("/by-company/{company_id}", response_model=list[DocumentResponse])
async def list_documents(company_id: str):
    company = await repo.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    docs = await repo.get_documents_for_company(company_id)
    return [DocumentResponse(id=d.id, company_id=d.company_id, filename=d.filename,
                             content_type=d.content_type, summary=d.summary,
                             chunk_count=d.chunk_count, created_at=d.created_at) for d in docs]


async def _doc_exists(document_id: str) -> bool:
    """Return True if the document row still exists (not deleted mid-ingest)."""
    from app.persistence.database import get_db
    db = await get_db()
    rows = await db.execute_fetchall("SELECT id FROM documents WHERE id = ?", (document_id,))
    return len(rows) > 0


async def _ingest_document(document_id: str, processed, operation_id: str, company_id: str) -> None:
    """Background task: persist sections, chunk, summarize, and embed a document."""
    from app.ingestion.document_processor import ProcessedDocument
    processed: ProcessedDocument

    try:
        await repo.update_operation(operation_id, status=OperationStatus.RUNNING,
                                    current_step="Storing sections...")

        # 1. Persist document sections
        section_id_map: dict[int, str] = {}  # section_index → section_id
        for section in processed.sections:
            if not await _doc_exists(document_id):
                await repo.update_operation(operation_id, status=OperationStatus.COMPLETED,
                                            current_step="Document deleted during ingestion", completed_at=utc_now())
                return
            section_id = await repo.create_document_section(
                document_id=document_id,
                section_index=section.index,
                title=section.title,
                section_type=section.section_type,
                text=section.text,
                char_count=section.char_count,
                is_boilerplate=section.is_boilerplate,
                start_page=section.start_page,
            )
            section_id_map[section.index] = section_id

        await repo.update_operation(operation_id, current_step="Chunking document...", steps_completed=1)

        # 2. Store chunks with section references and embed (with scoping metadata)
        for chunk in processed.chunks[:MAX_CHUNKS_PER_DOCUMENT]:
            if not await _doc_exists(document_id):
                await repo.update_operation(operation_id, status=OperationStatus.COMPLETED,
                                            current_step="Document deleted during ingestion", completed_at=utc_now())
                return
            embedding = None
            if use_real_apis():
                try:
                    embedding = await llm.embed_single(chunk.text)
                except Exception as e:
                    logger.warning(f"Chunk embedding failed: {e}")

            section_id = section_id_map.get(chunk.section_index)
            chunk_id = await repo.create_document_chunk(
                document_id, chunk.chunk_index, chunk.text,
                embedding=embedding,
                section_id=section_id,
                chunk_type=chunk.chunk_type,
                page_number=chunk.page_number,
            )

            # Index chunk for scoped retrieval
            if embedding:
                await repo.save_embedding(
                    "document_chunk", chunk_id, chunk.text[:500], embedding,
                    company_id=company_id, section_id=section_id,
                )

        await repo.update_document(document_id, chunk_count=len(processed.chunks))
        await repo.update_operation(operation_id, current_step="Generating summaries...", steps_completed=2)

        # 3. Generate section summaries
        non_boilerplate = [s for s in processed.sections if not s.is_boilerplate]
        summaries = await generate_section_summaries(non_boilerplate)
        for section_idx, summary in summaries.items():
            sid = section_id_map.get(section_idx)
            if sid:
                await repo.update_section_summary(sid, summary)
                # Index section summaries for FTS + embeddings with scoping
                await retriever.index_text(
                    sid, "section_summary", summary,
                    company_id=company_id, section_id=sid,
                )

        await repo.update_operation(operation_id, current_step="Generating document summary...", steps_completed=3)

        # 4. Generate overall document summary
        summary = processed.raw_text[:500] + "..."  # fallback
        if use_real_apis():
            try:
                summary = await llm.chat(
                    f"Summarize this document in 2-3 sentences:\n\n{processed.raw_text[:5000]}",
                    model="gpt-4o-mini",
                )
            except Exception as e:
                logger.warning(f"Document summary failed: {e}")

        section_count = len([s for s in processed.sections if not s.is_boilerplate])
        await repo.update_document(document_id, summary=summary)
        # Update section_count if column exists
        try:
            from app.persistence.database import get_db
            db = await get_db()
            await db.execute("UPDATE documents SET section_count = ? WHERE id = ?", (section_count, document_id))
            await db.commit()
        except Exception:
            pass  # column may not exist yet

        await repo.update_operation(
            operation_id, status=OperationStatus.COMPLETED,
            steps_completed=4, current_step="Document ingested",
            completed_at=utc_now(),
        )

    except Exception as e:
        logger.error(f"Document ingestion failed: {e}")
        await repo.update_operation(operation_id, status=OperationStatus.ERROR,
                                    error_message=str(e), completed_at=utc_now())
