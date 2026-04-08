"""Report compiler — generates executive brief from workspace insights."""

import json
import logging

from pydantic import BaseModel

from app.config import MAX_REPORT_SECTIONS
from app.domain.enums import OperationStatus
from app.persistence import repositories as repo
from app.services import llm
from app.shared.utils import utc_now

logger = logging.getLogger(__name__)


class ReportSection(BaseModel):
    title: str
    body: str
    insight_ids: list[str]
    source_ids: list[str]


class CompiledReport(BaseModel):
    executive_summary: str
    sections: list[ReportSection]
    reasons_to_believe: list[str]
    reasons_to_challenge: list[str]
    open_questions: list[str]


async def compile_report(
    report_id: str,
    workspace_id: str,
    analysis_id: str,
    operation_id: str,
) -> None:
    """Compile a report from workspace insights."""
    try:
        await repo.update_operation(operation_id, status=OperationStatus.RUNNING,
                                    current_step="Assembling insights...")

        # Gather data
        insights = await repo.get_insights(workspace_id)
        analysis = await repo.get_analysis(analysis_id)
        sources = await repo.get_sources_for_analysis(analysis_id)

        # Filter to pinned and suggested insights preferentially
        prioritized = sorted(insights, key=lambda i: (
            i.display_status.value == "pinned",
            i.display_status.value == "suggested",
            i.confidence_score,
        ), reverse=True)

        insight_texts = []
        for ins in prioritized[:20]:
            insight_texts.append(f"[{ins.display_status.value}] {ins.title}: {ins.body}")

        context = (
            f"Company: {analysis.company_name}\n"
            f"Market: {analysis.market_space}\n"
            f"{'Context: ' + analysis.company_context if analysis.company_context else ''}\n\n"
            f"Insights ({len(prioritized)} total, showing top {min(20, len(prioritized))}):\n"
            + "\n".join(insight_texts)
        )

        await repo.update_operation(operation_id, current_step="Generating report sections...", steps_completed=1)

        prompt = (
            f"Compile an executive brief report from these research insights.\n\n"
            f"{context}\n\n"
            f"Generate:\n"
            f"1. An executive summary (2-3 paragraphs)\n"
            f"2. Up to {MAX_REPORT_SECTIONS} sections covering: Market Opportunity, "
            f"Competitive Landscape, Strategic Fit, and Recommendation\n"
            f"3. Key reasons to believe (3-5)\n"
            f"4. Key reasons to challenge (3-5)\n"
            f"5. Open questions worth investigating (2-3)\n\n"
            f"Be specific, use data points from the insights."
        )

        try:
            result = await llm.chat_structured(
                prompt=prompt,
                response_model=CompiledReport,
                model="gpt-4o",
                system="You are a strategy consultant writing an executive brief. Be concise and evidence-based.",
            )
        except Exception as e:
            logger.error(f"Report compilation LLM failed: {e}")
            await repo.update_operation(operation_id, status=OperationStatus.ERROR,
                                        error_message=str(e), completed_at=utc_now())
            return

        # Store results
        await repo.update_operation(operation_id, current_step="Finalizing report...", steps_completed=2)

        sections_data = [
            {"title": s.title, "body": s.body,
             "insightIds": s.insight_ids, "sourceIds": s.source_ids}
            for s in result.sections[:MAX_REPORT_SECTIONS]
        ]

        await repo.update_report(
            report_id,
            executive_summary=result.executive_summary,
            sections_json=json.dumps(sections_data),
            rtb=result.reasons_to_believe,
            rtc=result.reasons_to_challenge,
            open_questions=result.open_questions,
            insight_count=len(prioritized),
            source_count=len(sources),
        )

        await repo.update_operation(
            operation_id,
            status=OperationStatus.COMPLETED,
            steps_completed=3,
            current_step="Report compiled",
            completed_at=utc_now(),
        )

    except Exception as e:
        logger.error(f"Report compilation failed: {e}")
        await repo.update_operation(operation_id, status=OperationStatus.ERROR,
                                    error_message=str(e), completed_at=utc_now())
