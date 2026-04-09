"""Tests for uncertainty-driven decision questions.

Tests question generation, answer storage, re-synthesis, API endpoints,
and schema/model correctness. All use mocked LLM responses.
"""

from __future__ import annotations

import json
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch

import aiosqlite

from app.domain.enums import AnswerType, DecisionQuestionCategory
from app.domain.models import DecisionQuestion
from app.shared.utils import utc_now
from app.workflows.decision_questions import (
    _build_user_input_context,
    _identify_lens_gaps,
    GeneratedQuestion,
    GeneratedQuestionsResult,
)


# ── Model / Enum tests ──

class TestDecisionQuestionModel:
    def test_decision_question_defaults(self):
        dq = DecisionQuestion(
            id="dq_1", analysis_id="ana_1",
            category=DecisionQuestionCategory.STRATEGIC_FIT,
            question_text="Does this align with priorities?",
            answer_type=AnswerType.SCALE_1_5,
        )
        assert dq.importance == "medium"
        assert dq.answer_value is None
        assert dq.sort_order == 0

    def test_all_categories(self):
        for cat in DecisionQuestionCategory:
            assert isinstance(cat.value, str)
        assert len(DecisionQuestionCategory) == 6

    def test_all_answer_types(self):
        for at in AnswerType:
            assert isinstance(at.value, str)
        assert len(AnswerType) == 4

    def test_decision_question_with_answer(self):
        dq = DecisionQuestion(
            id="dq_1", analysis_id="ana_1",
            category=DecisionQuestionCategory.RISK_TOLERANCE,
            question_text="How risk-tolerant is leadership?",
            answer_type=AnswerType.MULTIPLE_CHOICE,
            choices_json='["Conservative", "Moderate", "Aggressive"]',
            answer_value="Moderate",
        )
        assert dq.answer_value == "Moderate"
        assert json.loads(dq.choices_json) == ["Conservative", "Moderate", "Aggressive"]


# ── Strategy lens gap detection tests ──

class TestLensGapDetection:
    def test_full_lens_no_gaps(self):
        lens = {
            "strategicPriorities": [{"priority": "AI"}],
            "constraints": [{"constraint": "budget"}],
            "riskPosture": {"level": "aggressive"},
            "targetCustomers": {"segments": ["Enterprise"]},
            "gtmStrengths": ["Direct sales"],
            "internalFitSignals": ["Engineering talent"],
        }
        gaps = _identify_lens_gaps(lens)
        assert len(gaps) == 0

    def test_empty_lens_all_gaps(self):
        gaps = _identify_lens_gaps({})
        assert len(gaps) >= 5
        assert any("priorities" in g.lower() for g in gaps)
        assert any("constraints" in g.lower() for g in gaps)

    def test_partial_lens(self):
        lens = {
            "strategicPriorities": [{"priority": "AI"}],
            "constraints": [],
            "riskPosture": {"level": "moderate"},  # default = gap
            "targetCustomers": {},
            "gtmStrengths": ["Sales"],
            "internalFitSignals": [],
        }
        gaps = _identify_lens_gaps(lens)
        assert any("constraints" in g.lower() for g in gaps)
        assert any("risk" in g.lower() for g in gaps)
        assert any("customer" in g.lower() or "target" in g.lower() for g in gaps)


# ── User input context formatting tests ──

class TestUserInputContext:
    def test_formats_scale_answer(self):
        dq = DecisionQuestion(
            id="dq_1", analysis_id="ana_1",
            category=DecisionQuestionCategory.STRATEGIC_FIT,
            question_text="How well does this align?",
            answer_type=AnswerType.SCALE_1_5,
            importance="high",
            decision_impact="Directly affects strategic fit score.",
            answer_value="4",
        )
        ctx = _build_user_input_context([dq])
        assert "4/5" in ctx
        assert "Strategic Fit" in ctx
        assert "high" in ctx.lower()
        assert "Directly affects" in ctx

    def test_formats_yes_no_answer(self):
        dq = DecisionQuestion(
            id="dq_2", analysis_id="ana_1",
            category=DecisionQuestionCategory.CONSTRAINTS,
            question_text="Any hard constraints?",
            answer_type=AnswerType.YES_NO,
            importance="medium",
            decision_impact="Can disqualify the opportunity.",
            answer_value="Yes",
        )
        ctx = _build_user_input_context([dq])
        assert "Yes" in ctx
        assert "Constraints" in ctx

    def test_skips_unanswered(self):
        answered = DecisionQuestion(
            id="dq_1", analysis_id="ana_1",
            category=DecisionQuestionCategory.STRATEGIC_FIT,
            question_text="Align?",
            answer_type=AnswerType.YES_NO,
            answer_value="Yes",
        )
        unanswered = DecisionQuestion(
            id="dq_2", analysis_id="ana_1",
            category=DecisionQuestionCategory.RISK_TOLERANCE,
            question_text="Risk?",
            answer_type=AnswerType.SCALE_1_5,
            answer_value=None,
        )
        ctx = _build_user_input_context([answered, unanswered])
        assert "Align?" in ctx
        assert "Risk?" not in ctx

    def test_empty_list(self):
        ctx = _build_user_input_context([])
        assert ctx == ""


# ── DB schema tests ──

@pytest_asyncio.fixture
async def test_db():
    from app.persistence.database import SCHEMA_SQL, _run_migrations
    db = await aiosqlite.connect(":memory:")
    db.row_factory = aiosqlite.Row
    await db.executescript(SCHEMA_SQL)
    await db.commit()
    await _run_migrations(db)
    yield db
    await db.close()


class TestDecisionQuestionSchema:
    @pytest.mark.asyncio
    async def test_decision_questions_table_exists(self, test_db):
        cursor = await test_db.execute("PRAGMA table_info(decision_questions)")
        columns = {row[1] for row in await cursor.fetchall()}
        assert "id" in columns
        assert "analysis_id" in columns
        assert "category" in columns
        assert "question_text" in columns
        assert "answer_type" in columns
        assert "importance" in columns
        assert "decision_impact" in columns
        assert "choices_json" in columns
        assert "answer_value" in columns
        assert "sort_order" in columns
        assert "created_at" in columns

    @pytest.mark.asyncio
    async def test_insert_and_read_question(self, test_db):
        now = utc_now()
        await test_db.execute(
            "INSERT INTO decision_questions (id, analysis_id, category, question_text, answer_type, importance, decision_impact, sort_order, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
            ("dq_1", "ana_1", "strategic_fit", "Does this align?", "scale_1_5", "high", "Affects score.", 0, now),
        )
        await test_db.commit()
        cursor = await test_db.execute("SELECT * FROM decision_questions WHERE id = 'dq_1'")
        row = await cursor.fetchone()
        assert row["category"] == "strategic_fit"
        assert row["answer_type"] == "scale_1_5"
        assert row["answer_value"] is None

    @pytest.mark.asyncio
    async def test_update_answer(self, test_db):
        now = utc_now()
        await test_db.execute(
            "INSERT INTO decision_questions (id, analysis_id, category, question_text, answer_type, importance, sort_order, created_at) VALUES (?,?,?,?,?,?,?,?)",
            ("dq_2", "ana_1", "risk_tolerance", "Risk appetite?", "multiple_choice", "medium", 1, now),
        )
        await test_db.commit()
        await test_db.execute(
            "UPDATE decision_questions SET answer_value = ? WHERE id = ?",
            ("Moderate", "dq_2"),
        )
        await test_db.commit()
        cursor = await test_db.execute("SELECT answer_value FROM decision_questions WHERE id = 'dq_2'")
        row = await cursor.fetchone()
        assert row[0] == "Moderate"


# ── Question generation tests (mocked LLM) ──

class TestQuestionGeneration:
    @pytest.mark.asyncio
    async def test_generate_with_mocked_llm(self):
        mock_result = GeneratedQuestionsResult(questions=[
            GeneratedQuestion(
                question_text="Does this align with top strategic priorities?",
                category="strategic_fit",
                answer_type="scale_1_5",
                importance="high",
                decision_impact="Directly determines strategic fit assessment.",
            ),
            GeneratedQuestion(
                question_text="Would leadership accept longer time-to-revenue?",
                category="leadership",
                answer_type="yes_no",
                importance="high",
                decision_impact="Affects timing assessment and conditions to pursue.",
            ),
            GeneratedQuestion(
                question_text="How risk-tolerant is your organization?",
                category="risk_tolerance",
                answer_type="multiple_choice",
                importance="medium",
                decision_impact="Shapes whether 'maybe' becomes 'go' or 'no-go'.",
                choices=["Conservative", "Moderate", "Aggressive"],
            ),
        ])

        synthesis_data = {
            "recommendation": "maybe",
            "score": 55,
            "needsLeadershipInput": ["Strategic priority alignment", "Risk appetite"],
            "conditionsToPursue": ["Strong product-market fit signal"],
            "keyRisks": ["Established incumbents"],
        }

        with patch("app.workflows.decision_questions.llm") as mock_llm, \
             patch("app.workflows.decision_questions.repo") as mock_repo:
            mock_llm.chat_structured = AsyncMock(return_value=mock_result)
            mock_repo.create_decision_question = AsyncMock(side_effect=lambda **kwargs: DecisionQuestion(
                id="dq_test", analysis_id=kwargs["analysis_id"],
                category=DecisionQuestionCategory(kwargs["category"]),
                question_text=kwargs["question_text"],
                answer_type=AnswerType(kwargs["answer_type"]),
                importance=kwargs["importance"],
                decision_impact=kwargs["decision_impact"],
                choices_json=kwargs.get("choices_json"),
                sort_order=kwargs.get("sort_order", 0),
                created_at=utc_now(),
            ))

            from app.workflows.decision_questions import generate_decision_questions
            questions = await generate_decision_questions(
                analysis_id="ana_1",
                synthesis_data=synthesis_data,
                company_name="Acme Corp",
                market_space="cloud security",
            )

        assert len(questions) == 3
        assert any(q.category == DecisionQuestionCategory.STRATEGIC_FIT for q in questions)
        assert any(q.answer_type == AnswerType.YES_NO for q in questions)

    @pytest.mark.asyncio
    async def test_fallback_on_llm_failure(self):
        synthesis_data = {
            "recommendation": "maybe",
            "score": 50,
            "needsLeadershipInput": ["Do we have the talent?", "Is timing right?"],
            "conditionsToPursue": [],
            "keyRisks": [],
        }

        with patch("app.workflows.decision_questions.llm") as mock_llm, \
             patch("app.workflows.decision_questions.repo") as mock_repo:
            mock_llm.chat_structured = AsyncMock(side_effect=Exception("LLM down"))
            mock_repo.create_decision_question = AsyncMock(side_effect=lambda **kwargs: DecisionQuestion(
                id="dq_fb", analysis_id=kwargs["analysis_id"],
                category=DecisionQuestionCategory(kwargs["category"]),
                question_text=kwargs["question_text"],
                answer_type=AnswerType(kwargs["answer_type"]),
                importance=kwargs["importance"],
                decision_impact=kwargs["decision_impact"],
                choices_json=kwargs.get("choices_json"),
                sort_order=kwargs.get("sort_order", 0),
                created_at=utc_now(),
            ))

            from app.workflows.decision_questions import generate_decision_questions
            questions = await generate_decision_questions(
                analysis_id="ana_1",
                synthesis_data=synthesis_data,
                company_name="Acme Corp",
                market_space="cloud security",
            )

        # Should still get questions from the leadership input fallback
        assert len(questions) >= 2
        assert any("talent" in q.question_text.lower() for q in questions)


# ── API endpoint tests ──

class TestDecisionQuestionAPI:
    @pytest.fixture
    def client(self):
        from app.config import _force_mock
        import app.config as cfg
        cfg._force_mock = True
        from fastapi.testclient import TestClient
        from app.main import app
        with TestClient(app) as c:
            yield c
        cfg._force_mock = False

    def test_get_questions_404_no_analysis(self, client):
        resp = client.get("/api/analyses/nonexistent/decision-questions")
        assert resp.status_code == 404

    def test_apply_answers_404_no_analysis(self, client):
        resp = client.post("/api/analyses/nonexistent/apply-answers")
        assert resp.status_code == 404

    def test_answer_question_404(self, client):
        resp = client.patch(
            "/api/analyses/nonexistent/decision-questions/dq_none",
            json={"answerValue": "4"},
        )
        assert resp.status_code == 404


# ── Budget tests ──

class TestDecisionQuestionBudgets:
    def test_max_questions_configured(self):
        from app.config import MAX_DECISION_QUESTIONS
        assert MAX_DECISION_QUESTIONS > 0
        assert MAX_DECISION_QUESTIONS <= 12  # reasonable upper bound
