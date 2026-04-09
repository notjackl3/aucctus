import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  Rocket,
  TrendingUp,
  Target,
  Shield,
  FileText,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ThumbsUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Calendar,
  Globe,
  Users,
  Clock,
  HelpCircle,
  CheckCircle2,
  Crosshair,
  Eye,
  RefreshCw,
  Download,
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import WorkspacePDF from '../components/WorkspacePDF';
import { getAnalysis, getDecisionQuestions, answerDecisionQuestion, replaceDecisionQuestion, generateDecisionQuestion, applyAnswers, getOperation } from '../api/client';
import type {
  AnalysisResult,
  DecisionQuestion,
  IncumbentsResult,
  EmergingCompetitorsResult,
  MarketSizingResult,
  OpportunityAssessment,
  ConfidenceIndicator,
  Source,
} from '../types/analysis';
import CategoryCard from '../components/CategoryCard';
import ScoreGauge from '../components/ScoreGauge';
import RecommendationBadge from '../components/RecommendationBadge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import SourceCard from '../components/SourceCard';
import FindingsTray, { type PinnedFinding } from '../components/FindingsTray';
import SelectableBlock from '../components/SelectableBlock';
import SelectionToolbar from '../components/SelectionToolbar';
import AskAboutPanel from '../components/AskAboutPanel';
import { useTextSelection } from '../hooks/useTextSelection';

type CategoryKey = 'incumbents' | 'emerging' | 'market' | 'risks' | 'sources';

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  const [pinned, setPinned] = useState<PinnedFinding[]>([]);
  const { selection, clearSelection } = useTextSelection();
  const [askContext, setAskContext] = useState<{
    text: string;
    blockCategory: string;
    blockLabel: string;
  } | null>(null);

  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleDownloadPdf = useCallback(async () => {
    if (!data || generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const blob = await pdf(<WorkspacePDF data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const company = data.request.companyName.replace(/\s+/g, '-');
      const market = data.request.marketSpace.replace(/\s+/g, '-').slice(0, 40);
      a.href = url;
      a.download = `${company}-${market}-assessment.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGeneratingPdf(false);
    }
  }, [data, generatingPdf]);

  // Decision questions state
  const [questions, setQuestions] = useState<DecisionQuestion[]>([]);
  const [savingQ, setSavingQ] = useState<Record<string, boolean>>({});
  const [replacingQ, setReplacingQ] = useState<Record<string, boolean>>({});
  const [applyingAnswers, setApplyingAnswers] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    if (!id) { setError('No analysis ID'); setLoading(false); return; }
    Promise.all([getAnalysis(id), getDecisionQuestions(id).catch(() => [] as DecisionQuestion[])])
      .then(([analysis, qs]) => { setData(analysis); setQuestions(qs); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnswerQuestion = useCallback(async (questionId: string, value: string) => {
    if (!id) return;
    setSavingQ((prev) => ({ ...prev, [questionId]: true }));
    try {
      const updated = await answerDecisionQuestion(id, questionId, value);
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, answerValue: updated.answerValue } : q)));
      setApplySuccess(false);
      // Fire-and-forget: generate a new question to keep the unresolved pool replenished
      generateDecisionQuestion(id)
        .then((newQ) => setQuestions((prev) => [...prev, newQ]))
        .catch(() => {}); // silently ignore if generation fails
    } catch { /* user can retry */ }
    finally { setSavingQ((prev) => ({ ...prev, [questionId]: false })); }
  }, [id]);

  const handleReplaceQuestion = useCallback(async (questionId: string) => {
    if (!id) return;
    setReplacingQ((prev) => ({ ...prev, [questionId]: true }));
    try {
      const newQ = await replaceDecisionQuestion(id, questionId);
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? newQ : q)));
    } catch { /* silently fail — question stays */ }
    finally { setReplacingQ((prev) => ({ ...prev, [questionId]: false })); }
  }, [id]);

  const handleApplyAnswers = useCallback(async () => {
    if (!id) return;
    setApplyingAnswers(true);
    setApplyError(null);
    setApplySuccess(false);
    try {
      const result = await applyAnswers(id);
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const op = await getOperation(result.operationId);
        if (op.status === 'completed') {
          const analysis = await getAnalysis(id);
          setData(analysis);
          setApplySuccess(true);
          return;
        }
        if (op.status === 'error') { setApplyError(op.errorMessage || 'Re-synthesis failed'); return; }
      }
      setApplyError('Timed out waiting for update');
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Failed to apply answers');
    } finally { setApplyingAnswers(false); }
  }, [id]);

  const pinFinding = useCallback((finding: Omit<PinnedFinding, 'id'>) => {
    setPinned((prev) => {
      if (prev.some((f) => f.text === finding.text)) return prev;
      return [...prev, { ...finding, id: crypto.randomUUID() }];
    });
  }, []);

  const removePinned = useCallback((findingId: string) => {
    setPinned((prev) => prev.filter((f) => f.id !== findingId));
  }, []);

  const clearPinned = useCallback(() => setPinned([]), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-brand animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle size={40} className="text-nogo" />
        <h1 className="text-xl font-bold text-text-primary">Failed to Load</h1>
        <p className="text-sm text-text-secondary">{error || 'Unknown error'}</p>
        <button onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors">
          Back to Home
        </button>
      </div>
    );
  }

  const assessment = data.opportunityAssessment;
  const incumbents = data.incumbents;
  const emerging = data.emergingCompetitors;
  const market = data.marketSizing;

  // Aggregate all sources
  const allSources: Source[] = [
    ...(incumbents?.sources || []),
    ...(emerging?.sources || []),
    ...(market?.sources || []),
  ];

  // Research foundation cards — the 3 core research spaces
  const researchCategories: {
    key: CategoryKey;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    summary: string;
    stat?: string;
    confidence: ConfidenceIndicator | null;
    count?: number;
    countLabel?: string;
    available: boolean;
  }[] = [
    {
      key: 'incumbents',
      icon: Building2,
      title: 'Incumbents',
      summary: incumbents?.summary || 'Not yet researched',
      stat: incumbents ? `${incumbents.players.length} players` : undefined,
      confidence: incumbents?.confidence || null,
      count: incumbents?.players.length,
      countLabel: 'players',
      available: !!incumbents,
    },
    {
      key: 'emerging',
      icon: Rocket,
      title: 'Emerging Competitors',
      summary: emerging?.summary || 'Not yet researched',
      stat: emerging ? emerging.totalFundingInSpace : undefined,
      confidence: emerging?.confidence || null,
      count: emerging?.competitors.length,
      countLabel: 'startups',
      available: !!emerging,
    },
    {
      key: 'market',
      icon: TrendingUp,
      title: 'Market Sizing',
      summary: market?.summary || 'Not yet researched',
      stat: market?.tam ? `TAM ${market.tam}` : undefined,
      confidence: market?.confidence || null,
      available: !!market,
    },
  ];

  // Analysis cards — synthesis and evidence
  const analysisCategories: typeof researchCategories = [
    {
      key: 'risks',
      icon: Shield,
      title: 'Risks & Open Questions',
      summary: assessment?.keyRisks?.[0] || 'No risks identified yet',
      confidence: null,
      count: (assessment?.keyRisks?.length || 0) + (assessment?.needsLeadershipInput?.length || 0),
      countLabel: 'items',
      available: !!(assessment?.keyRisks?.length || assessment?.needsLeadershipInput?.length),
    },
    {
      key: 'sources',
      icon: FileText,
      title: 'Sources & Evidence',
      summary: `${allSources.length} sources across all research areas`,
      confidence: null,
      count: allSources.length,
      countLabel: 'sources',
      available: allSources.length > 0,
    },
  ];

  // Find the lowest-confidence research area for guidance
  const confidenceRanking = researchCategories
    .filter((c) => c.available && c.confidence)
    .sort((a, b) => (a.confidence?.score || 0) - (b.confidence?.score || 0));
  const weakestArea = confidenceRanking[0];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-8 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text-primary">{data.request.companyName}</h1>
              </div>
              <p className="text-sm text-text-secondary">{data.request.marketSpace}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {data.completedAt && (
              <span className="text-xs text-text-muted">
                {new Date(data.completedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
            )}
            <button
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-surface text-sm font-medium text-text-secondary hover:border-brand/40 hover:text-brand hover:bg-brand/[0.03] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download PDF report"
            >
              {generatingPdf ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {generatingPdf ? 'Generating…' : 'Export PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pb-8">
        <div className="flex gap-6">
          {/* Left column: recommendation + research + analysis */}
          <div className="w-80 shrink-0 space-y-1">
            {/* Strategic Score hero — click to return to overview */}
            {assessment && (
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full text-left p-5 rounded-xl border mb-4 transition-all group ${
                  activeCategory === null
                    ? 'bg-white border-brand/40 shadow-md shadow-brand/5'
                    : 'bg-white border-border hover:border-brand/30 hover:shadow-sm cursor-pointer'
                }`}
              >
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Strategic Score</span>
                <div className="flex justify-center mt-3 mb-2">
                  <ScoreGauge score={assessment.score} size="lg" />
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mt-3 group-hover:text-text-primary transition-colors">
                  {assessment.headline}
                </p>
                {/* Key signals at a glance */}
                <div className="mt-3 space-y-1.5">
                  {assessment.timingAssessment && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-text-muted" />
                      <span className="text-xs text-text-secondary">
                        <span className="font-medium capitalize">{assessment.timingAssessment}</span> timing
                      </span>
                    </div>
                  )}
                  {assessment.keyRisks?.[0] && (
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-maybe" />
                      <span className="text-xs text-text-secondary line-clamp-1">
                        {assessment.keyRisks[0]}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            )}

            {/* Research Foundation */}
            <div className="pt-1 pb-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Research Foundation</span>
            </div>
            {researchCategories.filter((c) => c.available).map((cat) => (
              <CategoryCard
                key={cat.key}
                icon={cat.icon}
                title={cat.title}
                summary={cat.summary}
                stat={cat.stat}
                confidence={cat.confidence}
                count={cat.count}
                countLabel={cat.countLabel}
                active={activeCategory === cat.key}
                onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
              />
            ))}

            {/* Synthesis & Evidence */}
            {analysisCategories.some((c) => c.available) && (
              <>
                <div className="pt-3 pb-2">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Synthesis & Evidence</span>
                </div>
                {analysisCategories.filter((c) => c.available).map((cat) => (
                  <CategoryCard
                    key={cat.key}
                    icon={cat.icon}
                    title={cat.title}
                    summary={cat.summary}
                    stat={cat.stat}
                    confidence={cat.confidence}
                    count={cat.count}
                    countLabel={cat.countLabel}
                    active={activeCategory === cat.key}
                    onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                  />
                ))}
              </>
            )}

            {/* Footer */}
            <div className="pt-4">
              <button onClick={() => navigate('/')}
                className="w-full text-sm text-brand hover:text-brand-dark font-medium transition-colors py-2">
                Run another assessment
              </button>
            </div>
          </div>

          {/* Right column: detail panel */}
          <div className="flex-1 min-w-0">
            {!activeCategory ? (
              <OverviewState
                assessment={assessment}
                weakestArea={weakestArea}
                onSelectCategory={setActiveCategory}
                questions={questions}
                savingQ={savingQ}
                replacingQ={replacingQ}
                onAnswerQuestion={handleAnswerQuestion}
                onReplaceQuestion={handleReplaceQuestion}
                applyingAnswers={applyingAnswers}
                applyError={applyError}
                applySuccess={applySuccess}
                onApplyAnswers={handleApplyAnswers}
              />
            ) : activeCategory === 'incumbents' && incumbents ? (
              <IncumbentsDetail data={incumbents} />
            ) : activeCategory === 'emerging' && emerging ? (
              <EmergingDetail data={emerging} />
            ) : activeCategory === 'market' && market ? (
              <MarketDetail data={market} />
            ) : activeCategory === 'risks' && assessment ? (
              <RisksDetail assessment={assessment} />
            ) : activeCategory === 'sources' ? (
              <SourcesDetail sources={allSources} />
            ) : (
              <OverviewState
                assessment={assessment}
                weakestArea={weakestArea}
                onSelectCategory={setActiveCategory}
                questions={questions}
                savingQ={savingQ}
                replacingQ={replacingQ}
                onAnswerQuestion={handleAnswerQuestion}
                onReplaceQuestion={handleReplaceQuestion}
                applyingAnswers={applyingAnswers}
                applyError={applyError}
                applySuccess={applySuccess}
                onApplyAnswers={handleApplyAnswers}
              />
            )}
          </div>
        </div>
      </div>

      {/* Selection toolbar */}
      {selection && (
        <SelectionToolbar
          selection={selection}
          onPin={() => {
            pinFinding({
              text: selection.text,
              category: selection.blockLabel || selection.blockCategory,
              type: 'insight',
            });
            clearSelection();
          }}
          onAsk={() => {
            setAskContext({
              text: selection.text,
              blockCategory: selection.blockCategory,
              blockLabel: selection.blockLabel,
            });
            clearSelection();
          }}
          onSource={() => {
            // Navigate to the sources view for the selected block's category
            setActiveCategory('sources');
            clearSelection();
          }}
          onDismiss={clearSelection}
        />
      )}

      {/* Ask about panel */}
      {askContext && id && (
        <AskAboutPanel
          analysisId={id}
          selectedText={askContext.text}
          blockCategory={askContext.blockCategory}
          blockLabel={askContext.blockLabel}
          onClose={() => setAskContext(null)}
        />
      )}

      {/* Pinning tray */}
      <FindingsTray findings={pinned} onRemove={removePinned} onClear={clearPinned} />
    </div>
  );
}


// ── Overview state (replaces empty detail) ──

function OverviewState({ assessment, weakestArea, onSelectCategory, questions, savingQ, replacingQ, onAnswerQuestion, onReplaceQuestion, applyingAnswers, applyError, applySuccess, onApplyAnswers }: {
  assessment?: OpportunityAssessment;
  weakestArea?: { key: CategoryKey; title: string; confidence: ConfidenceIndicator | null };
  onSelectCategory: (key: CategoryKey) => void;
  questions: DecisionQuestion[];
  savingQ: Record<string, boolean>;
  replacingQ: Record<string, boolean>;
  onAnswerQuestion: (questionId: string, value: string) => void;
  onReplaceQuestion: (questionId: string) => void;
  applyingAnswers: boolean;
  applyError: string | null;
  applySuccess: boolean;
  onApplyAnswers: () => void;
}) {
  if (!assessment) {
    return (
      <div className="flex items-center justify-center h-96 rounded-2xl border border-dashed border-border">
        <div className="text-center">
          <Target size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">Select a research area to explore</p>
        </div>
      </div>
    );
  }

  return (
    <SelectableBlock blockId="overview" category="assessment" label="Strategic Overview">
    <div className="space-y-5">
      {/* Reasoning — the full strategic argument */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Crosshair size={14} className="text-brand" />
          Strategic Assessment
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          {assessment.reasoning}
        </p>
        {assessment.strategicFitSummary && (
          <p className="text-sm text-text-secondary leading-relaxed mt-3">
            {assessment.strategicFitSummary}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {assessment.rightToWin && (
            <div className="p-3 rounded-lg bg-gray-50 border border-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Right to Win</p>
              <p className="text-sm text-text-secondary leading-relaxed">{assessment.rightToWin}</p>
            </div>
          )}
          {assessment.timingAssessment && (
            <div className="p-3 rounded-lg bg-gray-50 border border-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Market Timing</p>
              <p className="text-sm text-text-secondary leading-relaxed capitalize">{assessment.timingAssessment}</p>
            </div>
          )}
        </div>
      </div>

      {/* Conditions to Pursue */}
      {assessment.conditionsToPursue && assessment.conditionsToPursue.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-brand" />
            Conditions to Pursue
          </h3>
          <p className="text-xs text-text-muted mb-3">What must be true for this opportunity to be worth pursuing</p>
          <ul className="space-y-2">
            {assessment.conditionsToPursue.map((condition, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-brand" />
                <span className="text-sm text-text-secondary leading-relaxed">{condition}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Believe / Challenge — side by side for quick scanning */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold text-go mb-3 flex items-center gap-2">
            <ThumbsUp size={14} />
            Reasons to Believe ({assessment.reasonsToBelieve.length})
          </h3>
          <ul className="space-y-2">
            {assessment.reasonsToBelieve.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-go" />
                <span className="text-xs text-text-secondary leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold text-maybe mb-3 flex items-center gap-2">
            <AlertTriangle size={14} />
            Reasons to Challenge ({assessment.reasonsToChallenge.length})
          </h3>
          <ul className="space-y-2">
            {assessment.reasonsToChallenge.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-maybe" />
                <span className="text-xs text-text-secondary leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Decision Questions — inline */}
      {questions.length > 0 && (
        <DecisionQuestionsPanel
          questions={questions}
          savingQ={savingQ}
          replacingQ={replacingQ}
          onAnswerQuestion={onAnswerQuestion}
          onReplaceQuestion={onReplaceQuestion}
          applyingAnswers={applyingAnswers}
          applyError={applyError}
          applySuccess={applySuccess}
          onApplyAnswers={onApplyAnswers}
        />
      )}
    </div>
    </SelectableBlock>
  );
}


// ── Simple list item (no pin button — use text selection instead) ──

function ListItem({ text, dotColor }: { text: string; dotColor: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
      <span className="text-sm text-text-secondary leading-relaxed">{text}</span>
    </li>
  );
}


// ── Decision Questions Panel (tabbed) ──

function DecisionQuestionsPanel({
  questions, savingQ, replacingQ, onAnswerQuestion, onReplaceQuestion,
  applyingAnswers, applyError, applySuccess, onApplyAnswers,
}: {
  questions: DecisionQuestion[];
  savingQ: Record<string, boolean>;
  replacingQ: Record<string, boolean>;
  onAnswerQuestion: (id: string, value: string) => void;
  onReplaceQuestion: (id: string) => void;
  applyingAnswers: boolean;
  applyError: string | null;
  applySuccess: boolean;
  onApplyAnswers: () => void;
}) {
  const unresolved = questions.filter((q) => q.answerValue === null);
  const resolved = questions.filter((q) => q.answerValue !== null);
  const [tab, setTab] = useState<'unresolved' | 'resolved'>('unresolved');

  // Auto-switch to resolved tab if all questions are answered
  const activeTab = unresolved.length === 0 && resolved.length > 0 ? 'resolved' : tab;

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <HelpCircle size={14} className="text-brand" />
          Decision Questions
        </h3>
        <span className="text-[10px] text-text-muted">{resolved.length}/{questions.length} resolved</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setTab('unresolved')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'unresolved'
              ? 'bg-white text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Unresolved
          {unresolved.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === 'unresolved' ? 'bg-brand/10 text-brand' : 'bg-gray-200 text-text-muted'
            }`}>
              {unresolved.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('resolved')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'resolved'
              ? 'bg-white text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Resolved
          {resolved.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === 'resolved' ? 'bg-go/20 text-go' : 'bg-gray-200 text-text-muted'
            }`}>
              {resolved.length}
            </span>
          )}
        </button>
      </div>

      {/* Unresolved tab */}
      {activeTab === 'unresolved' && (
        unresolved.length > 0 ? (
          <div className="space-y-3">
            {unresolved.map((q) => (
              <InlineQuestionCard
                key={q.id}
                question={q}
                saving={savingQ[q.id] || false}
                replacing={replacingQ[q.id] || false}
                onAnswer={(v) => onAnswerQuestion(q.id, v)}
                onReplace={() => onReplaceQuestion(q.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <CheckCircle2 size={28} className="text-go mx-auto mb-2" />
            <p className="text-sm text-text-primary font-medium">All questions resolved</p>
            <p className="text-xs text-text-muted mt-1">Switch to Resolved to review your answers.</p>
          </div>
        )
      )}

      {/* Resolved tab */}
      {activeTab === 'resolved' && (
        resolved.length > 0 ? (
          <div className="space-y-2">
            {resolved.map((q) => (
              <InlineQuestionCard
                key={q.id}
                question={q}
                saving={savingQ[q.id] || false}
                replacing={false}
                onAnswer={(v) => onAnswerQuestion(q.id, v)}
                onReplace={() => onReplaceQuestion(q.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <HelpCircle size={28} className="text-text-muted mx-auto mb-2" />
            <p className="text-xs text-text-muted">No questions answered yet.</p>
          </div>
        )
      )}

      {/* Apply footer — always visible when there are resolved questions */}
      {resolved.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-primary">
              {applySuccess ? 'Assessment updated.' : 'Ready to update assessment'}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">
              {applySuccess ? 'Score reflects your inputs.' : 'Re-runs synthesis only — no new research.'}
            </p>
          </div>
          <button
            onClick={onApplyAnswers}
            disabled={applyingAnswers || applySuccess}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              applySuccess
                ? 'bg-go-light text-go cursor-default'
                : applyingAnswers
                  ? 'bg-brand/10 text-brand cursor-wait'
                  : 'bg-brand text-white hover:bg-brand-dark'
            }`}
          >
            {applyingAnswers ? (
              <><Loader2 size={12} className="animate-spin" /> Updating...</>
            ) : applySuccess ? (
              <><CheckCircle2 size={12} /> Applied</>
            ) : (
              <><RefreshCw size={12} /> Update Assessment</>
            )}
          </button>
        </div>
      )}
      {applyError && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-nogo">
          <AlertTriangle size={12} />
          {applyError}
        </div>
      )}
    </div>
  );
}


// ── Inline Decision Question Card ──

const IMPORTANCE_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: 'bg-nogo-light', text: 'text-nogo' },
  medium: { bg: 'bg-maybe-light', text: 'text-maybe' },
  low: { bg: 'bg-gray-100', text: 'text-text-muted' },
};

function InlineQuestionCard({ question: q, saving, replacing, onAnswer, onReplace }: {
  question: DecisionQuestion;
  saving: boolean;
  replacing: boolean;
  onAnswer: (value: string) => void;
  onReplace: () => void;
}) {
  const [draft, setDraft] = useState(q.answerValue || '');
  const imp = IMPORTANCE_COLORS[q.importance] || IMPORTANCE_COLORS.medium;
  const isAnswered = q.answerValue !== null;

  return (
    <div className={`rounded-lg border p-3.5 transition-colors ${
      replacing ? 'border-border opacity-50' : isAnswered ? 'border-go/30 bg-go/[0.02]' : 'border-border'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-xs font-medium text-text-primary leading-snug">{q.questionText}</p>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${imp.bg} ${imp.text}`}>
            {q.importance}
          </span>
          {isAnswered && <CheckCircle2 size={12} className="text-go" />}
          {!isAnswered && (
            <button
              onClick={onReplace}
              disabled={replacing || saving}
              title="Don't know — replace with a different question"
              className="p-1 rounded text-text-muted hover:text-brand hover:bg-brand/10 disabled:opacity-40 transition-colors"
            >
              {replacing
                ? <Loader2 size={11} className="animate-spin" />
                : <RefreshCw size={11} />
              }
            </button>
          )}
        </div>
      </div>
      <p className="text-[10px] text-text-muted mb-2.5">{q.decisionImpact}</p>

      {q.answerType === 'scale_1_5' && (
        <InlineScaleInput value={q.answerValue} saving={saving} onSelect={onAnswer} />
      )}
      {q.answerType === 'yes_no' && (
        <InlineYesNoInput value={q.answerValue} saving={saving} onSelect={onAnswer} />
      )}
      {q.answerType === 'multiple_choice' && q.choices && (
        <InlineMultipleChoiceInput choices={q.choices} value={q.answerValue} saving={saving} onSelect={onAnswer} />
      )}
      {q.answerType === 'short_text' && (
        <div className="flex gap-1.5">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 text-xs px-2.5 py-2 rounded-lg border border-border bg-white text-text-primary placeholder-text-muted focus:outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20"
          />
          <button
            onClick={() => draft.trim() && onAnswer(draft.trim())}
            disabled={!draft.trim() || saving}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-brand text-white hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}

function InlineScaleInput({ value, saving, onSelect }: {
  value: string | null; saving: boolean; onSelect: (v: string) => void;
}) {
  const labels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const selected = value === String(n);
        return (
          <button
            key={n}
            onClick={() => onSelect(String(n))}
            disabled={saving}
            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
              selected
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-white text-text-secondary border-border hover:border-brand/30 hover:bg-brand/5'
            } disabled:opacity-50`}
            title={labels[n - 1]}
          >
            {n}
            <span className="block text-[9px] opacity-70 mt-0.5">{labels[n - 1]}</span>
          </button>
        );
      })}
    </div>
  );
}

function InlineYesNoInput({ value, saving, onSelect }: {
  value: string | null; saving: boolean; onSelect: (v: string) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {['Yes', 'No'].map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            disabled={saving}
            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
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

function InlineMultipleChoiceInput({ choices, value, saving, onSelect }: {
  choices: string[]; value: string | null; saving: boolean; onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {choices.map((choice) => {
        const selected = value === choice;
        return (
          <button
            key={choice}
            onClick={() => onSelect(choice)}
            disabled={saving}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
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


// ── Incumbents Detail ──

function IncumbentsDetail({ data }: { data: IncumbentsResult }) {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  const togglePlayer = (name: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  return (
    <SelectableBlock blockId="incumbents" category="incumbents" label="Incumbents">
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide flex items-center gap-2">
              <Building2 size={14} className="text-brand" />
              Incumbents
            </h2>
            <ConfidenceBadge confidence={data.confidence} />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-2">{data.summary}</p>
          <p className="text-[10px] text-text-muted">{data.players.length} players · {data.marketConcentration}</p>
        </div>

        {data.players.map((player) => {
          const isExpanded = expandedPlayers.has(player.name);
          return (
            <div key={player.name} className="bg-white rounded-xl border border-border overflow-hidden">
              <button onClick={() => togglePlayer(player.name)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                {isExpanded
                  ? <ChevronDown size={16} className="text-text-muted shrink-0" />
                  : <ChevronRight size={16} className="text-text-muted shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{player.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      player.marketPosition === 'Leader' ? 'bg-go-light text-go' : 'bg-gray-100 text-text-secondary'
                    }`}>{player.marketPosition}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{player.description}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {player.estimatedRevenue && (
                    <span className="text-xs text-text-muted">{player.estimatedRevenue}</span>
                  )}
                  {player.founded && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Calendar size={12} />{player.founded}
                    </span>
                  )}
                </div>
              </button>
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border-light">
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div>
                      <h4 className="text-xs font-semibold text-go mb-2 uppercase tracking-wide">Strengths</h4>
                      <ul className="space-y-1.5">
                        {player.strengths.map((s, i) => (
                          <ListItem key={i} text={s} dotColor="bg-go" />
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-nogo mb-2 uppercase tracking-wide">Weaknesses</h4>
                      <ul className="space-y-1.5">
                        {player.weaknesses.map((w, i) => (
                          <ListItem key={i} text={w} dotColor="bg-nogo" />
                        ))}
                      </ul>
                    </div>
                  </div>
                  {player.headquarters && (
                    <div className="flex items-center gap-1 text-xs text-text-muted mt-4">
                      <Globe size={12} />{player.headquarters}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <SourcesBlock sources={data.sources} />
      </div>
    </SelectableBlock>
  );
}


// ── Emerging Competitors Detail ──

function EmergingDetail({ data }: { data: EmergingCompetitorsResult }) {
  const [expandedComps, setExpandedComps] = useState<Set<string>>(new Set());

  const toggleComp = (name: string) => {
    setExpandedComps((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  return (
    <SelectableBlock blockId="emerging" category="emerging_competitors" label="Emerging Competitors">
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide flex items-center gap-2">
              <Rocket size={14} className="text-brand" />
              Emerging Competitors
            </h2>
            <ConfidenceBadge confidence={data.confidence} />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-2">{data.summary}</p>
          <p className="text-[10px] text-text-muted">{data.competitors.length} startups · {data.totalFundingInSpace} total funding · <span className="capitalize">{data.fundingTrend}</span> trend</p>
        </div>

        {data.competitors.map((comp) => {
          const isExpanded = expandedComps.has(comp.name);
          return (
            <div key={comp.name} className="bg-white rounded-xl border border-border overflow-hidden">
              <button onClick={() => toggleComp(comp.name)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                {isExpanded
                  ? <ChevronDown size={16} className="text-text-muted shrink-0" />
                  : <ChevronRight size={16} className="text-text-muted shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{comp.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                      {comp.fundingStage}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{comp.description}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {comp.fundingAmount && (
                    <span className="text-xs text-text-muted">{comp.fundingAmount}</span>
                  )}
                  {comp.fundingDate && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Calendar size={12} />{comp.fundingDate}
                    </span>
                  )}
                </div>
              </button>
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border-light">
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-brand mb-1.5 uppercase tracking-wide">Differentiator</h4>
                      <p className="text-xs text-text-secondary leading-relaxed">{comp.differentiator}</p>
                    </div>
                    {comp.investors && comp.investors.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">Investors</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {comp.investors.map((inv) => (
                            <span key={inv} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-text-secondary">{inv}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <SourcesBlock sources={data.sources} />
      </div>
    </SelectableBlock>
  );
}


// ── Market Sizing Detail ──

function MarketDetail({ data }: { data: MarketSizingResult }) {
  return (
    <SelectableBlock blockId="market" category="market_sizing" label="Market Sizing">
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide flex items-center gap-2">
              <TrendingUp size={14} className="text-brand" />
              Market Sizing
            </h2>
            <ConfidenceBadge confidence={data.confidence} />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-4">{data.summary}</p>

          <div className="space-y-2">
            {[
              { label: 'TAM', value: data.tam, sub: 'Total Addressable Market' },
              { label: 'SAM', value: data.sam, sub: 'Serviceable Available Market' },
              { label: 'SOM', value: data.som, sub: 'Serviceable Obtainable Market' },
              { label: 'CAGR', value: data.cagr, sub: data.timeframe || 'Growth Rate' },
            ]
              .filter((item) => item.value && item.value !== 'N/A')
              .map((item) => (
              <div key={item.label} className="flex items-start gap-3 px-3.5 py-2.5 rounded-lg bg-gray-50 border border-border">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide w-10 shrink-0 pt-0.5">{item.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-primary leading-relaxed">{item.value}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-go uppercase tracking-wide mb-3">Growth Drivers</h3>
              <ul className="space-y-2">
                {data.growthDrivers.map((d, i) => (
                  <ListItem key={i} text={d} dotColor="bg-go" />
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-maybe uppercase tracking-wide mb-3">Constraints</h3>
              <ul className="space-y-2">
                {data.constraints.map((c, i) => (
                  <ListItem key={i} text={c} dotColor="bg-maybe" />
                ))}
              </ul>
            </div>
          </div>
        </div>

        <SourcesBlock sources={data.sources} />
      </div>
    </SelectableBlock>
  );
}


// ── Risks & Open Questions Detail ──

function RisksDetail({ assessment }: { assessment: OpportunityAssessment }) {
  return (
    <SelectableBlock blockId="risks" category="assessment" label="Risks & Open Questions">
      <div className="space-y-4">
        {/* Key Risks */}
        {assessment.keyRisks.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
              <Shield size={14} className="text-nogo" />
              Key Risks
            </h2>
            <ul className="space-y-2.5">
              {assessment.keyRisks.map((risk, i) => (
                <ListItem key={i} text={risk} dotColor="bg-nogo" />
              ))}
            </ul>
          </div>
        )}

        {/* Leadership Input */}
        {assessment.needsLeadershipInput && assessment.needsLeadershipInput.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
              <HelpCircle size={14} className="text-maybe" />
              Leadership Judgment Needed
            </h2>
            <p className="text-xs text-text-muted mb-4">These questions cannot be answered by research alone — they require strategic judgment from your team.</p>
            <ul className="space-y-2.5">
              {assessment.needsLeadershipInput.map((q, i) => (
                <ListItem key={i} text={q} dotColor="bg-text-secondary" />
              ))}
            </ul>
          </div>
        )}

        {/* White Space */}
        {assessment.whiteSpaceOpportunities.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
              <Target size={14} className="text-brand" />
              White Space Opportunities
            </h2>
            <ul className="space-y-2.5">
              {assessment.whiteSpaceOpportunities.map((opp, i) => (
                <ListItem key={i} text={opp} dotColor="bg-brand" />
              ))}
            </ul>
          </div>
        )}
      </div>
    </SelectableBlock>
  );
}


// ── Sources Detail ──

function SourcesDetail({ sources }: { sources: Source[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? sources : sources.slice(0, 8);

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
        <FileText size={14} className="text-brand" />
        Sources & Evidence ({sources.length})
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {visible.map((src, i) => (
          <SourceCard key={i} source={src} />
        ))}
      </div>
      {sources.length > 8 && (
        <button onClick={() => setShowAll(!showAll)}
          className="mt-4 text-xs text-brand hover:text-brand-dark font-medium transition-colors">
          {showAll ? 'Show fewer' : `Show all ${sources.length} sources`}
        </button>
      )}
    </div>
  );
}


// ── Sources block (reusable within detail sections) ──

function SourcesBlock({ sources }: { sources: Source[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? sources : sources.slice(0, 2);

  if (sources.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
        Sources ({sources.length})
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {visible.map((src, i) => (
          <SourceCard key={i} source={src} />
        ))}
      </div>
      {sources.length > 2 && (
        <button onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-brand hover:text-brand-dark font-medium transition-colors">
          {showAll ? 'Show fewer' : `Show all ${sources.length} sources`}
        </button>
      )}
    </div>
  );
}
