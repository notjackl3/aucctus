"""Company + strategy lens endpoints."""

import json
import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from app.api.schemas import (
    CompanyResponse, CreateCompanyRequest, UpdateCompanyContextRequest,
)
from app.config import use_real_apis
from app.persistence import repositories as repo
from app.services import llm
from app.strategy.engine import build_strategy_lens

logger = logging.getLogger(__name__)

_SUGGESTION_COUNT = 20

_FALLBACK_SUGGESTIONS = [
    "AI-Powered Healthcare Diagnostics", "Climate Tech & Carbon Markets",
    "Enterprise Cybersecurity", "Digital Financial Infrastructure",
    "Autonomous Logistics & Delivery", "Consumer Health & Wellness Tech",
    "Precision Agriculture", "Edge Computing Platforms",
    "B2B SaaS Vertical Solutions", "Supply Chain Visibility Tools",
    "Next-Gen Identity & Access Management", "Embedded Finance for SMBs",
    "Developer Infrastructure & Tooling", "Workplace Productivity AI",
    "Smart Energy Management", "Healthcare Revenue Cycle Automation",
    "Real-Time Compliance Monitoring", "Data Governance Platforms",
    "AI-Driven Customer Support", "Sustainable Packaging Tech",
]


class _Suggestions(BaseModel):
    suggestions: list[str]


async def _generate_and_persist_suggestions(company_id: str, company_name: str, context: str | None) -> None:
    """Generate suggestions in the background and persist to DB."""
    try:
        context_block = f"\nCompany context:\n{context[:1200]}" if context else ""
        prompt = (
            f"Company: {company_name}{context_block}\n\n"
            f"Generate exactly {_SUGGESTION_COUNT} specific market spaces or adjacencies this company could plausibly explore. "
            "Each should be 3–7 words, concrete and distinct — not generic categories. "
            "Think about realistic strategic expansions given the company's profile. "
            f"Return only a JSON object with a 'suggestions' array of {_SUGGESTION_COUNT} strings."
        )
        result = await llm.chat_structured(
            prompt=prompt,
            response_model=_Suggestions,
            model="gpt-4o-mini",
            system="You are a strategic market analyst. Return only valid JSON.",
        )
        suggestions = result.suggestions[:_SUGGESTION_COUNT]
        await repo.save_market_suggestions(company_id, suggestions)
        logger.info("Generated %d market suggestions for company %s", len(suggestions), company_id)
    except Exception:
        logger.exception("Failed to generate market suggestions for company %s", company_id)


router = APIRouter(prefix="/companies", tags=["companies"])


@router.post("", response_model=CompanyResponse, status_code=201)
async def create_company(req: CreateCompanyRequest, background_tasks: BackgroundTasks):
    company = await repo.create_company(name=req.name, context=req.context)
    if use_real_apis():
        background_tasks.add_task(_generate_and_persist_suggestions, company.id, company.name, company.context)
    return CompanyResponse(id=company.id, name=company.name, context=company.context,
                           created_at=company.created_at, updated_at=company.updated_at)


@router.get("", response_model=list[CompanyResponse])
async def list_companies():
    companies = await repo.list_companies()
    return [CompanyResponse(id=c.id, name=c.name, context=c.context,
                            created_at=c.created_at, updated_at=c.updated_at) for c in companies]


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: str):
    company = await repo.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return CompanyResponse(id=company.id, name=company.name, context=company.context,
                           created_at=company.created_at, updated_at=company.updated_at)


@router.put("/{company_id}/context")
async def update_context(company_id: str, req: UpdateCompanyContextRequest, background_tasks: BackgroundTasks):
    company = await repo.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    await repo.update_company_context(company_id, req.context)
    if use_real_apis():
        background_tasks.add_task(_generate_and_persist_suggestions, company_id, company.name, req.context)
    return {"status": "ok"}


@router.post("/{company_id}/strategy")
async def build_strategy(company_id: str):
    """Build or rebuild the strategy lens for a company."""
    company = await repo.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if not company.context:
        raise HTTPException(status_code=400, detail="Company has no context — add context first")

    if not use_real_apis():
        # Return a minimal mock lens
        from app.strategy.engine import _minimal_lens
        lens = _minimal_lens(company.name)
        lens_id = await repo.save_strategy_lens(company_id, json.dumps(lens), "Mock lens — no API keys configured")
        stored = await repo.get_latest_strategy_lens(company_id)
        return stored

    # Get document texts if available
    docs = await repo.get_documents_for_company(company_id)
    doc_texts = [d.raw_text for d in docs if d.raw_text]

    lens = await build_strategy_lens(company.name, company.context, doc_texts or None)
    confidence_note = f"Built from company context ({len(company.context)} chars)"
    if doc_texts:
        confidence_note += f" and {len(doc_texts)} documents"

    await repo.save_strategy_lens(company_id, json.dumps(lens), confidence_note)
    stored = await repo.get_latest_strategy_lens(company_id)
    return stored


@router.get("/{company_id}/market-suggestions")
async def get_market_suggestions(company_id: str, background_tasks: BackgroundTasks):
    """Return company-tailored market space ideas for the input page bubbles.

    Returns the pre-generated pool (up to 20). The frontend randomises which
    subset is displayed on each page load — no LLM call happens here unless
    no suggestions have been generated yet.
    """
    company = await repo.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    if not use_real_apis():
        return {"suggestions": _FALLBACK_SUGGESTIONS}

    stored = await repo.get_market_suggestions(company_id)
    if stored:
        return {"suggestions": stored}

    # First visit — generate synchronously so the caller gets real data, then
    # the result is already persisted for future calls.
    await _generate_and_persist_suggestions(company_id, company.name, company.context)
    stored = await repo.get_market_suggestions(company_id)
    return {"suggestions": stored or _FALLBACK_SUGGESTIONS}


@router.delete("/{company_id}", status_code=204)
async def delete_company(company_id: str):
    """Delete a company and all associated data."""
    company = await repo.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    await repo.delete_company(company_id)


@router.get("/{company_id}/strategy")
async def get_strategy(company_id: str):
    """Get the latest strategy lens for a company."""
    company = await repo.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    lens = await repo.get_latest_strategy_lens(company_id)
    if not lens:
        raise HTTPException(status_code=404, detail="No strategy lens built yet")
    return lens
