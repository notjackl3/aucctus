"""Ask-about-selection — grounded Q&A for selected text in the workspace.

Context assembly flow:
1. Anchor: selected text + block metadata
2. Linked evidence: claims matching the selection + their sources
3. Company doc context: hierarchical retrieval scoped to company
4. Bounded assembly → 1 gpt-4o-mini call
"""

import json
import logging
from dataclasses import dataclass, field

from app.persistence import repositories as repo
from app.retrieval import retriever
from app.services import llm
from app.workflows.user_memory import build_user_memory_context

logger = logging.getLogger(__name__)

# ── Constants ──

MAX_CLAIM_CONTEXT_CHARS = 2000
MAX_DOC_CONTEXT_CHARS = 2000
MAX_ANALYSIS_CONTEXT_CHARS = 1500


@dataclass
class AskSelectionResult:
    answer: str
    source_ids: list[str] = field(default_factory=list)
    confidence: str = "medium"


async def ask_about_selection(
    analysis_id: str,
    selected_text: str,
    question: str,
    block_category: str,
    block_label: str = "",
) -> AskSelectionResult:
    """Answer a user question about selected text, grounded in evidence.

    Uses three context layers:
    1. Linked claims/sources for the selected text
    2. Company document context via hierarchical retrieval
    3. Analysis result context for the relevant category
    """
    analysis = await repo.get_analysis(analysis_id)
    if not analysis:
        raise ValueError(f"Analysis {analysis_id} not found")

    # ── Layer 1: Linked claims + sources ──
    claims = await repo.get_claims_for_analysis(analysis_id)
    sources = await repo.get_sources_for_analysis(analysis_id)
    source_map = {s.id: s for s in sources}

    # Find claims that mention entities/terms from the selected text
    selection_lower = selected_text.lower()
    selection_terms = set(w for w in selection_lower.split() if len(w) > 3)

    matched_claims = []
    matched_source_ids = set()
    for claim in claims:
        # Match by entity overlap or statement text overlap
        claim_text = claim.statement.lower()
        entity_match = any(e.lower() in selection_lower for e in claim.entities)
        term_overlap = sum(1 for t in selection_terms if t in claim_text)

        if entity_match or term_overlap >= 2:
            matched_claims.append(claim)
            matched_source_ids.update(claim.source_ids)

    # Build claim context
    claim_context_parts = []
    char_count = 0
    for claim in matched_claims[:10]:
        entry = f"- {claim.statement}"
        src_snippets = []
        for sid in claim.source_ids[:2]:
            src = source_map.get(sid)
            if src:
                src_snippets.append(f"  [{src.title}, tier: {src.tier.value}]")
        entry += "\n".join(src_snippets)

        if char_count + len(entry) > MAX_CLAIM_CONTEXT_CHARS:
            break
        claim_context_parts.append(entry)
        char_count += len(entry)

    claim_context = "\n".join(claim_context_parts) if claim_context_parts else ""

    # ── Layer 2: Company document context ──
    doc_context = ""
    company_id = None

    # Try to find company_id from workspace
    workspace = await repo.get_workspace_by_analysis(analysis_id)
    if workspace and workspace.company_id:
        company_id = workspace.company_id
        search_query = f"{selected_text} {question}"
        assembled = await retriever.hierarchical_retrieve(
            search_query, company_id=company_id,
            token_budget=MAX_DOC_CONTEXT_CHARS // 4,  # convert chars to approx tokens
        )
        if assembled.text:
            doc_context = assembled.text[:MAX_DOC_CONTEXT_CHARS]

    # ── Layer 3: Analysis result context ──
    analysis_context = ""
    if analysis.result_json:
        result_data = json.loads(analysis.result_json)
        analysis_context = _extract_category_context(
            result_data, block_category, analysis.company_name, analysis.market_space)

    # ── Layer 4: User memory (decision answers + past interactions) ──
    user_memory = await build_user_memory_context(analysis_id)

    # ── Assemble prompt ──
    context_sections = [
        f"Company: {analysis.company_name}\nMarket: {analysis.market_space}",
    ]

    if user_memory:
        context_sections.append(user_memory)

    if analysis_context:
        context_sections.append(f"ANALYSIS DATA:\n{analysis_context}")

    if claim_context:
        context_sections.append(
            f"LINKED EVIDENCE ({len(matched_claims)} claims from {len(matched_source_ids)} sources):\n{claim_context}")

    if doc_context:
        context_sections.append(f"COMPANY DOCUMENTS:\n{doc_context}")

    context_block = "\n\n".join(context_sections)

    system_prompt = (
        "You are a strategic research assistant. Answer the user's question about "
        "the highlighted text, grounded in the evidence and analysis data provided. "
        "Be concise and specific. Cite evidence when possible. "
        "If the evidence is contradictory or insufficient, say so clearly. "
        "Keep your answer under 200 words. "
        "Write in plain text only — no markdown, no asterisks, no bullet symbols. "
        "Use numbered lists with plain text when listing items. "
        "IMPORTANT: If the user has provided strategic inputs or prior interactions, "
        "use that context to tailor your answer to their specific perspective and choices."
    )

    user_prompt = (
        f"CONTEXT:\n{context_block}\n\n"
        f"SELECTED TEXT (from {block_label or block_category}):\n"
        f'"{selected_text}"\n\n'
        f"USER QUESTION:\n{question}"
    )

    answer = await llm.chat(prompt=user_prompt, system=system_prompt)
    answer_text = answer.strip()

    # Save interaction for future memory
    await repo.save_interaction(
        analysis_id=analysis_id,
        interaction_type="ask",
        user_input=f"[About: {selected_text[:80]}] {question}",
        ai_response=answer_text[:300],
        block_category=block_category,
        block_label=block_label,
    )

    return AskSelectionResult(
        answer=answer_text,
        source_ids=list(matched_source_ids)[:10],
        confidence="high" if len(matched_claims) >= 3 else "medium" if matched_claims else "low",
    )


def _extract_category_context(result_data: dict, category: str,
                              company_name: str, market_space: str) -> str:
    """Extract bounded context from the analysis result for a given category."""
    parts = []
    cat = category.lower()

    if "incumbent" in cat and "incumbents" in result_data:
        inc = result_data["incumbents"]
        parts.append(f"Incumbents summary: {inc.get('summary', '')[:300]}")
        for p in (inc.get("players") or [])[:5]:
            parts.append(f"- {p.get('name')}: {p.get('description', '')[:100]}")

    if "emerging" in cat and "emerging_competitors" in result_data:
        ec = result_data["emerging_competitors"]
        parts.append(f"Emerging competitors: {ec.get('summary', '')[:300]}")
        for c in (ec.get("competitors") or [])[:5]:
            parts.append(f"- {c.get('name')}: {c.get('differentiator', '')[:100]}")

    if "market" in cat and "market_sizing" in result_data:
        ms = result_data["market_sizing"]
        parts.append(
            f"Market: TAM={ms.get('tam','N/A')}, SAM={ms.get('sam','N/A')}, "
            f"CAGR={ms.get('cagr','N/A')}")

    # Always include the assessment
    oa = result_data.get("opportunity_assessment")
    if oa:
        parts.append(
            f"Recommendation: {oa.get('recommendation')} (score {oa.get('score')})\n"
            f"Reasoning: {oa.get('reasoning','')[:200]}")

    text = "\n".join(parts)
    return text[:MAX_ANALYSIS_CONTEXT_CHARS]
