"""Document upload + ingestion endpoints."""

import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File, Form

from app.api.schemas import DocumentResponse, UploadDocumentResponse
from app.config import MAX_DOCUMENTS_PER_COMPANY, MAX_CHUNKS_PER_DOCUMENT, use_real_apis
from app.domain.enums import OperationStatus
from app.persistence import repositories as repo
from app.services import llm
from app.services.search import extract_text_from_bytes
from app.shared.utils import utc_now

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])


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
    raw_text = extract_text_from_bytes(content, content_type)

    doc = await repo.create_document(company_id, file.filename or "unnamed", content_type, raw_text)
    operation = await repo.create_operation("document_ingest", parent_id=company_id, steps_total=3)

    background_tasks.add_task(_ingest_document, doc.id, raw_text, operation.id)

    return UploadDocumentResponse(document_id=doc.id, operation_id=operation.id, status="pending")


@router.get("/by-company/{company_id}", response_model=list[DocumentResponse])
async def list_documents(company_id: str):
    company = await repo.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    docs = await repo.get_documents_for_company(company_id)
    return [DocumentResponse(id=d.id, company_id=d.company_id, filename=d.filename,
                             content_type=d.content_type, summary=d.summary,
                             chunk_count=d.chunk_count, created_at=d.created_at) for d in docs]


async def _ingest_document(document_id: str, raw_text: str, operation_id: str) -> None:
    """Background task: chunk, summarize, and embed a document."""
    try:
        await repo.update_operation(operation_id, status=OperationStatus.RUNNING,
                                    current_step="Extracting text...")

        # 1. Chunk the text
        chunks = _chunk_text(raw_text, chunk_size=1000, overlap=100)
        await repo.update_operation(operation_id, current_step="Chunking document...", steps_completed=1)

        # 2. Store chunks and embed if APIs available
        for i, chunk_text in enumerate(chunks[:MAX_CHUNKS_PER_DOCUMENT]):
            embedding = None
            if use_real_apis():
                try:
                    embedding = await llm.embed_single(chunk_text)
                except Exception as e:
                    logger.warning(f"Chunk embedding failed: {e}")
            await repo.create_document_chunk(document_id, i, chunk_text, embedding)

        await repo.update_document(document_id, chunk_count=len(chunks))
        await repo.update_operation(operation_id, current_step="Generating summary...", steps_completed=2)

        # 3. Generate summary
        summary = raw_text[:500] + "..."  # fallback
        if use_real_apis():
            try:
                summary = await llm.chat(
                    f"Summarize this document in 2-3 sentences:\n\n{raw_text[:5000]}",
                    model="gpt-4o-mini",
                )
            except Exception as e:
                logger.warning(f"Document summary failed: {e}")

        await repo.update_document(document_id, summary=summary)

        await repo.update_operation(
            operation_id, status=OperationStatus.COMPLETED,
            steps_completed=3, current_step="Document ingested",
            completed_at=utc_now(),
        )

    except Exception as e:
        logger.error(f"Document ingestion failed: {e}")
        await repo.update_operation(operation_id, status=OperationStatus.ERROR,
                                    error_message=str(e), completed_at=utc_now())


def _chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> list[str]:
    """Split text into overlapping chunks."""
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk.strip())
        start = end - overlap
    return chunks
