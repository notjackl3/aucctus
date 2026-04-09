"""Workspace user memory — builds context from decision answers + past interactions.

Loaded once per LLM call and injected into the prompt so that the model
is aware of what the user has already said, chosen, or asked about.
"""

from __future__ import annotations

from app.persistence import repositories as repo

# Keep the memory block compact — no more than ~1500 chars
MAX_MEMORY_CHARS = 1500


async def build_user_memory_context(analysis_id: str) -> str:
    """Return a formatted string summarising the user's inputs for this analysis.

    Includes:
      - Answered decision questions (category + Q + A)
      - Recent ask-about-selection interactions (user question + short answer)

    Returns empty string if the user has made no inputs yet.
    """
    parts: list[str] = []

    # ── Decision question answers ──
    questions = await repo.get_decision_questions(analysis_id)
    answered = [q for q in questions if q.answer_value is not None]
    if answered:
        lines = []
        for q in answered:
            cat_label = q.category.value.replace("_", " ").title()
            lines.append(f"- [{cat_label}] {q.question_text} → {q.answer_value}")
        parts.append("USER STRATEGIC INPUTS:\n" + "\n".join(lines))

    # ── Recent interactions ──
    interactions = await repo.get_recent_interactions(analysis_id, limit=8)
    if interactions:
        lines = []
        for i in reversed(interactions):  # chronological order
            user_q = i["user_input"][:120]
            ai_a = i["ai_response"][:150]
            lines.append(f"- User asked: {user_q}\n  Answer: {ai_a}")
        parts.append("RECENT USER INTERACTIONS:\n" + "\n".join(lines))

    if not parts:
        return ""

    text = "\n\n".join(parts)
    if len(text) > MAX_MEMORY_CHARS:
        text = text[:MAX_MEMORY_CHARS] + "..."
    return text
