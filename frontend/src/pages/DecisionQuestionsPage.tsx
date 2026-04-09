import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { getAnalysis, getDecisionQuestions, answerDecisionQuestion, applyAnswers, getOperation } from '../api/client';
import type { DecisionQuestion } from '../types/analysis';
import ScoreGauge from '../components/ScoreGauge';
import RecommendationBadge from '../components/RecommendationBadge';

const CATEGORY_LABELS: Record<string, string> = {
  strategic_fit: 'Strategic Fit',
  risk_tolerance: 'Risk Tolerance',
  capability: 'Capability',
  market_intent: 'Market Intent',
  leadership: 'Leadership',
  constraints: 'Constraints',
};

const IMPORTANCE_STYLES: Record<string, { bg: string; text: string }> = {
  high: { bg: 'bg-nogo-light', text: 'text-nogo' },
  medium: { bg: 'bg-maybe-light', text: 'text-maybe' },
  low: { bg: 'bg-gray-100', text: 'text-text-muted' },
};

export default function DecisionQuestionsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<DecisionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  // Lightweight analysis info for header context
  const [companyName, setCompanyName] = useState('');
  const [marketSpace, setMarketSpace] = useState('');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getDecisionQuestions(id),
      getAnalysis(id),
    ]).then(([qs, analysis]) => {
      setQuestions(qs);
      setCompanyName(analysis.request.companyName);
      setMarketSpace(analysis.request.marketSpace);
      if (analysis.opportunityAssessment) {
        setRecommendation(analysis.opportunityAssessment.recommendation);
        setScore(analysis.opportunityAssessment.score);
      }
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const answeredCount = questions.filter((q) => q.answerValue !== null).length;

  const handleAnswer = useCallback(async (questionId: string, value: string) => {
    if (!id) return;
    setSaving((prev) => ({ ...prev, [questionId]: true }));
    try {
      const updated = await answerDecisionQuestion(id, questionId, value);
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, answerValue: updated.answerValue } : q)),
      );
      setApplySuccess(false);
    } catch {
      // user can retry
    } finally {
      setSaving((prev) => ({ ...prev, [questionId]: false }));
    }
  }, [id]);

  const handleApply = useCallback(async () => {
    if (!id) return;
    setApplying(true);
    setApplyError(null);
    setApplySuccess(false);
    try {
      const result = await applyAnswers(id);
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const op = await getOperation(result.operationId);
        if (op.status === 'completed') {
          // Refresh recommendation
          const analysis = await getAnalysis(id);
          if (analysis.opportunityAssessment) {
            setRecommendation(analysis.opportunityAssessment.recommendation);
            setScore(analysis.opportunityAssessment.score);
          }
          setApplySuccess(true);
          return;
        }
        if (op.status === 'error') {
          setApplyError(op.errorMessage || 'Re-synthesis failed');
          return;
        }
      }
      setApplyError('Timed out waiting for update');
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Failed to apply answers');
    } finally {
      setApplying(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-brand animate-spin" />
      </div>
    );
  }

  // Group questions by category
  const grouped = questions.reduce<Record<string, DecisionQuestion[]>>((acc, q) => {
    (acc[q.category] ??= []).push(q);
    return acc;
  }, {});

  const highImportance = questions.filter((q) => q.importance === 'high');
  const otherQuestions = questions.filter((q) => q.importance !== 'high');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-8 pt-8 pb-6">
        <button
          onClick={() => navigate(`/workspace/${id}`)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Workspace
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <HelpCircle size={20} className="text-brand" />
              <h1 className="text-2xl font-bold text-text-primary">Decision Questions</h1>
            </div>
            <p className="text-sm text-text-secondary ml-8">
              {companyName} in {marketSpace}
            </p>
            <p className="text-xs text-text-muted ml-8 mt-1">
              These questions are optional. Answering them helps the system refine its recommendation
              using your strategic judgment on areas it cannot assess from public research alone.
            </p>
          </div>

          {/* Current recommendation mini-card */}
          {recommendation && score !== null && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white shrink-0">
              <ScoreGauge score={score} size="sm" />
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wide font-semibold mb-0.5">Current</p>
                <RecommendationBadge recommendation={recommendation as 'go' | 'no-go' | 'maybe'} />
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-5 ml-8">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-text-muted">
              {answeredCount} of {questions.length} answered
            </span>
            {answeredCount > 0 && !applySuccess && (
              <span className="text-xs font-medium text-brand">
                Ready to update assessment
              </span>
            )}
            {applySuccess && (
              <span className="text-xs font-medium text-go">
                Assessment updated
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${applySuccess ? 'bg-go' : 'bg-brand'}`}
              style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-3xl mx-auto px-8 pb-8 space-y-6">
        {/* High importance first */}
        {highImportance.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 ml-1">
              <div className="w-2 h-2 rounded-full bg-nogo" />
              <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                High Impact ({highImportance.length})
              </span>
              <span className="text-xs text-text-muted">
                — directly affects the recommendation
              </span>
            </div>
            <div className="space-y-3">
              {highImportance.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  saving={saving[q.id] || false}
                  onAnswer={(v) => handleAnswer(q.id, v)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other questions */}
        {otherQuestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 ml-1">
              <div className="w-2 h-2 rounded-full bg-maybe" />
              <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                Additional Context ({otherQuestions.length})
              </span>
              <span className="text-xs text-text-muted">
                — adjusts confidence and nuance
              </span>
            </div>
            <div className="space-y-3">
              {otherQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  saving={saving[q.id] || false}
                  onAnswer={(v) => handleAnswer(q.id, v)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Apply footer */}
        {answeredCount > 0 && (
          <div className="sticky bottom-4 bg-white rounded-2xl border border-border shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {applySuccess
                    ? 'Recommendation has been updated with your inputs.'
                    : `${answeredCount} answer${answeredCount > 1 ? 's' : ''} ready to apply`}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {applySuccess
                    ? 'Return to the workspace to see the updated assessment.'
                    : 'This re-runs only the synthesis — no new research is performed.'}
                </p>
              </div>
              <button
                onClick={handleApply}
                disabled={applying || applySuccess}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  applySuccess
                    ? 'bg-go-light text-go cursor-default'
                    : applying
                      ? 'bg-brand/10 text-brand cursor-wait'
                      : 'bg-brand text-white hover:bg-brand-dark'
                }`}
              >
                {applying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating Assessment...
                  </>
                ) : applySuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    Applied
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Update Assessment
                  </>
                )}
              </button>
            </div>
            {applyError && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-nogo">
                <AlertTriangle size={12} />
                {applyError}
              </div>
            )}
          </div>
        )}

        {questions.length === 0 && (
          <div className="text-center py-16">
            <HelpCircle size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-muted">No decision questions were generated for this analysis.</p>
            <button
              onClick={() => navigate(`/workspace/${id}`)}
              className="mt-4 text-sm text-brand hover:text-brand-dark font-medium transition-colors"
            >
              Return to workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


function QuestionCard({ question: q, saving, onAnswer }: {
  question: DecisionQuestion;
  saving: boolean;
  onAnswer: (value: string) => void;
}) {
  const [draft, setDraft] = useState(q.answerValue || '');
  const imp = IMPORTANCE_STYLES[q.importance] || IMPORTANCE_STYLES.medium;
  const isAnswered = q.answerValue !== null;

  return (
    <div className={`bg-white rounded-xl border p-5 transition-colors ${
      isAnswered ? 'border-go/30 bg-go/[0.02]' : 'border-border'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-medium text-text-primary leading-snug">{q.questionText}</p>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${imp.bg} ${imp.text}`}>
            {q.importance}
          </span>
          {isAnswered && <CheckCircle2 size={14} className="text-go" />}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] text-text-muted font-medium px-1.5 py-0.5 rounded bg-gray-100">
          {CATEGORY_LABELS[q.category] || q.category}
        </span>
        <span className="text-[10px] text-text-muted">{q.decisionImpact}</span>
      </div>

      {q.answerType === 'scale_1_5' && (
        <ScaleInput value={q.answerValue} saving={saving} onSelect={onAnswer} />
      )}
      {q.answerType === 'yes_no' && (
        <YesNoInput value={q.answerValue} saving={saving} onSelect={onAnswer} />
      )}
      {q.answerType === 'multiple_choice' && q.choices && (
        <MultipleChoiceInput choices={q.choices} value={q.answerValue} saving={saving} onSelect={onAnswer} />
      )}
      {q.answerType === 'short_text' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 text-sm px-3 py-2.5 rounded-lg border border-border bg-white text-text-primary placeholder-text-muted focus:outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20"
          />
          <button
            onClick={() => draft.trim() && onAnswer(draft.trim())}
            disabled={!draft.trim() || saving}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-brand text-white hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}


function ScaleInput({ value, saving, onSelect }: {
  value: string | null;
  saving: boolean;
  onSelect: (v: string) => void;
}) {
  const labels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => {
        const selected = value === String(n);
        return (
          <button
            key={n}
            onClick={() => onSelect(String(n))}
            disabled={saving}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              selected
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-white text-text-secondary border-border hover:border-brand/30 hover:bg-brand/5'
            } disabled:opacity-50`}
            title={labels[n - 1]}
          >
            {n}
            <span className="block text-[10px] opacity-70 mt-0.5">{labels[n - 1]}</span>
          </button>
        );
      })}
    </div>
  );
}


function YesNoInput({ value, saving, onSelect }: {
  value: string | null;
  saving: boolean;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {['Yes', 'No'].map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            disabled={saving}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              selected
                ? opt === 'Yes'
                  ? 'bg-go text-white border-go shadow-sm'
                  : 'bg-nogo text-white border-nogo shadow-sm'
                : 'bg-white text-text-secondary border-border hover:border-brand/30 hover:bg-brand/5'
            } disabled:opacity-50`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}


function MultipleChoiceInput({ choices, value, saving, onSelect }: {
  choices: string[];
  value: string | null;
  saving: boolean;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {choices.map((choice) => {
        const selected = value === choice;
        return (
          <button
            key={choice}
            onClick={() => onSelect(choice)}
            disabled={saving}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              selected
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-white text-text-secondary border-border hover:border-brand/30 hover:bg-brand/5'
            } disabled:opacity-50`}
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
}
