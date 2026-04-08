"""Exploration agent — answers questions, generates insights and follow-ups.

Workflow: planning → retrieval → answering → follow-up generation.
"""

import logging
from pydantic import BaseModel

from app.config import (
    FOLLOW_UPS_PER_QUESTION, INSIGHTS_PER_EXPLORATION_QUESTION,
    MAX_EXPLORATION_DEPTH,
)
from app.domain.enums import OperationStatus, QuestionStatus
from app.persistence import repositories as repo
from app.retrieval import retriever
from app.services import llm
from app.shared.utils import utc_now
from app.strategy.engine import critique_with_lens

logger = logging.getLogger(__name__)


class ExplorationAnswer(BaseModel):
    answer_text: str
    confidence_score: int  # 0-100
    confidence_level: str  # high, medium, low
    confidence_reasoning: str


class ExplorationInsight(BaseModel):
    title: str
    body: str
    tags: list[str]
    confidence_score: int


class FollowUp(BaseModel):
    question_text: str
    reason: str


class ExplorationResult(BaseModel):
    answer: ExplorationAnswer
    insights: list[ExplorationInsight]
    follow_ups: list[FollowUp]


async def explore_question(
    question_id: str,
    workspace_id: str,
    operation_id: str,
    strategy_lens: dict | None = None,
) -> None:
    """Run the full exploration flow for a question."""
    try:
        question = await repo.get_question(question_id)
        if not question:
            return

        workspace = await repo.get_workspace(workspace_id)
        if not workspace:
            return

        await repo.update_question_status(question_id, QuestionStatus.ANSWERING)
        await repo.update_operation(operation_id, status=OperationStatus.RUNNING,
                                    current_step="Planning research approach...")

        # 1. Retrieve relevant context
        await repo.update_operation(operation_id, current_step="Retrieving relevant evidence...", steps_completed=1)
        context_results = await retriever.hybrid_search(question.question_text, workspace_id, limit=15)
        context_text = "\n\n".join(r.get("text", "")[:500] for r in context_results[:10])

        # 2. Search for new evidence if needed
        from app.services import search as search_svc
        from app.config import use_real_apis
        new_evidence = ""
        if use_real_apis():
            try:
                search_results = await search_svc.search(
                    f"{workspace.market_space} {question.question_text}", max_results=4)
                new_evidence = "\n\n".join(
                    f"[{r.title}]: {r.content[:500]}" for r in search_results[:4])
            except Exception as e:
                logger.warning(f"Exploration search failed: {e}")

        # 3. Generate answer
        await repo.update_operation(operation_id, current_step="Generating answer...", steps_completed=2)

        lens_context = ""
        if strategy_lens:
            priorities = [p.get("priority", "") for p in strategy_lens.get("strategicPriorities", [])[:3]]
            lens_context = f"\nCompany strategy: {', '.join(priorities)}"

        prompt = (
            f"Question about {workspace.market_space} (for {workspace.company_name}):\n"
            f"{question.question_text}\n\n"
            f"Existing research context:\n{context_text}\n\n"
            f"New search results:\n{new_evidence}\n\n"
            f"{lens_context}\n\n"
            f"Provide a thorough, evidence-based answer. Also generate up to "
            f"{INSIGHTS_PER_EXPLORATION_QUESTION} key insights and up to "
            f"{FOLLOW_UPS_PER_QUESTION} follow-up questions that would deepen understanding.\n"
            f"Each follow-up should have a clear reason explaining why it's worth exploring."
        )

        try:
            result = await llm.chat_structured(
                prompt=prompt,
                response_model=ExplorationResult,
                model="gpt-4o",
                system="You are a research analyst. Provide evidence-based answers with specific data points.",
            )
        except Exception as e:
            logger.error(f"Exploration LLM failed: {e}")
            await repo.update_question_status(question_id, QuestionStatus.ERROR)
            await repo.update_operation(operation_id, status=OperationStatus.ERROR,
                                        error_message=str(e), completed_at=utc_now())
            return

        # 4. Store answer
        contradictions_found = 0  # Could detect from context
        await repo.update_question_answer(
            question_id,
            answer_text=result.answer.answer_text,
            confidence_score=result.answer.confidence_score,
            confidence_level=result.answer.confidence_level,
            confidence_reasoning=result.answer.confidence_reasoning,
            strategy_lens_applied=strategy_lens is not None,
            contradictions_found=contradictions_found,
        )

        # 5. Create insights
        await repo.update_operation(operation_id, current_step="Creating insights...", steps_completed=3)
        for ins in result.insights[:INSIGHTS_PER_EXPLORATION_QUESTION]:
            await repo.create_insight(workspace_id, {
                "question_id": question_id,
                "source_step": "exploration",
                "title": ins.title,
                "body": ins.body,
                "tags": ins.tags,
                "confidence_score": ins.confidence_score,
                "confidence_level": result.answer.confidence_level,
                "confidence_reasoning": f"Generated from exploration of: {question.question_text[:80]}",
                "display_status": "visible",
            })

        # 6. Create follow-ups (only if not too deep)
        if question.depth < MAX_EXPLORATION_DEPTH:
            for fu in result.follow_ups[:FOLLOW_UPS_PER_QUESTION]:
                await repo.create_follow_up(question_id, fu.question_text, fu.reason)

        # 7. Mark complete
        await repo.update_operation(
            operation_id,
            status=OperationStatus.COMPLETED,
            steps_completed=4,
            current_step="Exploration complete",
            completed_at=utc_now(),
        )

    except Exception as e:
        logger.error(f"Exploration failed: {e}")
        await repo.update_question_status(question_id, QuestionStatus.ERROR)
        await repo.update_operation(operation_id, status=OperationStatus.ERROR,
                                    error_message=str(e), completed_at=utc_now())
