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
  Pin,
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
} from 'lucide-react';
import { getAnalysis } from '../api/client';
import type {
  AnalysisResult,
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

type CategoryKey = 'incumbents' | 'emerging' | 'market' | 'risks' | 'sources';

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  const [pinned, setPinned] = useState<PinnedFinding[]>([]);

  useEffect(() => {
    if (!id) { setError('No analysis ID'); setLoading(false); return; }
    getAnalysis(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
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
      stat: market ? `TAM ${market.tam} · CAGR ${market.cagr}` : undefined,
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
                {assessment && <RecommendationBadge recommendation={assessment.recommendation} />}
              </div>
              <p className="text-sm text-text-secondary">{data.request.marketSpace}</p>
            </div>
          </div>
          {data.completedAt && (
            <span className="text-xs text-text-muted">
              {new Date(data.completedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pb-8">
        <div className="flex gap-6">
          {/* Left column: recommendation + research + analysis */}
          <div className="w-80 shrink-0 space-y-1">
            {/* Strategic Recommendation hero */}
            {assessment && (
              <div className="p-5 rounded-xl bg-white border border-border mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Strategic Recommendation</span>
                  <ScoreGauge score={assessment.score} size="sm" />
                </div>
                <RecommendationBadge recommendation={assessment.recommendation} size="lg" />
                <p className="text-sm text-text-secondary leading-relaxed mt-3">
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
                <div className="mt-3">
                  <ConfidenceBadge confidence={assessment.confidence} />
                </div>
              </div>
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
              />
            ) : activeCategory === 'incumbents' && incumbents ? (
              <IncumbentsDetail data={incumbents} onPin={pinFinding} />
            ) : activeCategory === 'emerging' && emerging ? (
              <EmergingDetail data={emerging} onPin={pinFinding} />
            ) : activeCategory === 'market' && market ? (
              <MarketDetail data={market} onPin={pinFinding} />
            ) : activeCategory === 'risks' && assessment ? (
              <RisksDetail assessment={assessment} onPin={pinFinding} />
            ) : activeCategory === 'sources' ? (
              <SourcesDetail sources={allSources} />
            ) : (
              <OverviewState
                assessment={assessment}
                weakestArea={weakestArea}
                onSelectCategory={setActiveCategory}
              />
            )}
          </div>
        </div>
      </div>

      {/* Pinning tray */}
      <FindingsTray findings={pinned} onRemove={removePinned} onClear={clearPinned} />
    </div>
  );
}


// ── Overview state (replaces empty detail) ──

function OverviewState({ assessment, weakestArea, onSelectCategory }: {
  assessment?: OpportunityAssessment;
  weakestArea?: { key: CategoryKey; title: string; confidence: ConfidenceIndicator | null };
  onSelectCategory: (key: CategoryKey) => void;
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

      {/* What to inspect next — guidance */}
      <div className="bg-gray-50 rounded-xl border border-border p-4">
        <h3 className="text-xs font-semibold text-text-primary mb-2 flex items-center gap-2">
          <Eye size={12} className="text-brand" />
          Where to Look Next
        </h3>
        <div className="space-y-2">
          {weakestArea && weakestArea.confidence && (
            <button
              onClick={() => onSelectCategory(weakestArea.key as CategoryKey)}
              className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-white transition-colors group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-maybe shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-medium text-text-primary group-hover:text-brand transition-colors">
                  Review {weakestArea.title}
                </span>
                <span className="text-xs text-text-muted ml-1.5">
                  — lowest confidence ({weakestArea.confidence.score}%)
                </span>
              </div>
              <ChevronRight size={12} className="text-text-muted group-hover:text-brand" />
            </button>
          )}
          {assessment.needsLeadershipInput && assessment.needsLeadershipInput.length > 0 && (
            <button
              onClick={() => onSelectCategory('risks')}
              className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-white transition-colors group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-nogo shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-medium text-text-primary group-hover:text-brand transition-colors">
                  {assessment.needsLeadershipInput.length} question{assessment.needsLeadershipInput.length > 1 ? 's' : ''} requiring leadership judgment
                </span>
              </div>
              <ChevronRight size={12} className="text-text-muted group-hover:text-brand" />
            </button>
          )}
          {assessment.whiteSpaceOpportunities.length > 0 && (
            <div className="flex items-start gap-3 p-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1 shrink-0" />
              <span className="text-xs text-text-secondary">
                {assessment.whiteSpaceOpportunities.length} white space opportunit{assessment.whiteSpaceOpportunities.length > 1 ? 'ies' : 'y'} identified — review in research detail
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Pinnable item helper ──

function PinnableItem({ text, category, type, onPin }: {
  text: string;
  category: string;
  type: PinnedFinding['type'];
  onPin: (f: Omit<PinnedFinding, 'id'>) => void;
}) {
  const dotColor = {
    belief: 'bg-go',
    challenge: 'bg-maybe',
    risk: 'bg-nogo',
    opportunity: 'bg-brand',
    insight: 'bg-text-secondary',
    driver: 'bg-go',
    constraint: 'bg-maybe',
  }[type];

  return (
    <li className="flex items-start gap-2.5 group">
      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
      <span className="text-sm text-text-secondary leading-relaxed flex-1">{text}</span>
      <button
        onClick={() => onPin({ text, category, type })}
        className="shrink-0 p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Pin this finding"
      >
        <Pin size={12} className="text-text-muted" />
      </button>
    </li>
  );
}


// ── Incumbents Detail ──

function IncumbentsDetail({ data, onPin }: {
  data: IncumbentsResult;
  onPin: (f: Omit<PinnedFinding, 'id'>) => void;
}) {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  const togglePlayer = (name: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide flex items-center gap-2">
            <Building2 size={14} className="text-brand" />
            Incumbents
          </h2>
          <ConfidenceBadge confidence={data.confidence} />
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-2">{data.summary}</p>
        <p className="text-xs text-text-muted">{data.players.length} players · {data.marketConcentration}</p>
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
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <DollarSign size={12} />{player.estimatedRevenue}
                  </span>
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
                        <PinnableItem key={i} text={s} category={`${player.name} — Strength`} type="insight" onPin={onPin} />
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-nogo mb-2 uppercase tracking-wide">Weaknesses</h4>
                    <ul className="space-y-1.5">
                      {player.weaknesses.map((w, i) => (
                        <PinnableItem key={i} text={w} category={`${player.name} — Weakness`} type="challenge" onPin={onPin} />
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
  );
}


// ── Emerging Competitors Detail ──

function EmergingDetail({ data, onPin }: {
  data: EmergingCompetitorsResult;
  onPin: (f: Omit<PinnedFinding, 'id'>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide flex items-center gap-2">
            <Rocket size={14} className="text-brand" />
            Emerging Competitors
          </h2>
          <ConfidenceBadge confidence={data.confidence} />
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">{data.summary}</p>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 border border-border">
            <DollarSign size={16} className="text-brand" />
            <div>
              <p className="text-lg font-bold text-text-primary">{data.totalFundingInSpace}</p>
              <p className="text-xs text-text-muted">Total Funding</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 border border-border">
            <TrendingUp size={16} className="text-brand" />
            <div>
              <p className="text-lg font-bold text-text-primary capitalize">{data.fundingTrend}</p>
              <p className="text-xs text-text-muted">Trend</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 border border-border">
            <Users size={16} className="text-brand" />
            <div>
              <p className="text-lg font-bold text-text-primary">{data.competitors.length}</p>
              <p className="text-xs text-text-muted">Startups</p>
            </div>
          </div>
        </div>
      </div>

      {data.competitors.map((comp) => (
        <div key={comp.name} className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-text-primary">{comp.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
              {comp.fundingStage}
            </span>
            {comp.fundingAmount && (
              <span className="text-xs text-text-muted">{comp.fundingAmount}</span>
            )}
          </div>
          <p className="text-xs text-text-muted mb-2">{comp.description}</p>
          <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-text-secondary mb-2">
            <strong className="text-text-primary">Differentiator:</strong> {comp.differentiator}
          </div>
          <div className="flex items-center justify-between">
            {comp.investors && comp.investors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Investors:</span>
                {comp.investors.map((inv) => (
                  <span key={inv} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-text-secondary">{inv}</span>
                ))}
              </div>
            )}
            <button
              onClick={() => onPin({ text: `${comp.name}: ${comp.differentiator}`, category: 'Emerging Competitors', type: 'insight' })}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="Pin this competitor"
            >
              <Pin size={12} className="text-text-muted" />
            </button>
          </div>
        </div>
      ))}

      <SourcesBlock sources={data.sources} />
    </div>
  );
}


// ── Market Sizing Detail ──

function MarketDetail({ data, onPin }: {
  data: MarketSizingResult;
  onPin: (f: Omit<PinnedFinding, 'id'>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide flex items-center gap-2">
            <TrendingUp size={14} className="text-brand" />
            Market Sizing
          </h2>
          <ConfidenceBadge confidence={data.confidence} />
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">{data.summary}</p>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'TAM', value: data.tam, sub: 'Total Addressable' },
            { label: 'SAM', value: data.sam, sub: 'Serviceable' },
            { label: 'SOM', value: data.som || 'N/A', sub: 'Obtainable' },
            { label: 'CAGR', value: data.cagr, sub: data.timeframe },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 rounded-xl bg-gray-50 border border-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{item.label}</p>
              <p className="text-xl font-bold text-text-primary mt-1">{item.value}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{item.sub}</p>
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
                <PinnableItem key={i} text={d} category="Market — Driver" type="driver" onPin={onPin} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-maybe uppercase tracking-wide mb-3">Constraints</h3>
            <ul className="space-y-2">
              {data.constraints.map((c, i) => (
                <PinnableItem key={i} text={c} category="Market — Constraint" type="constraint" onPin={onPin} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      <SourcesBlock sources={data.sources} />
    </div>
  );
}


// ── Risks & Open Questions Detail ──

function RisksDetail({ assessment, onPin }: {
  assessment: OpportunityAssessment;
  onPin: (f: Omit<PinnedFinding, 'id'>) => void;
}) {
  return (
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
              <PinnableItem key={i} text={risk} category="Risks" type="risk" onPin={onPin} />
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
              <PinnableItem key={i} text={q} category="Leadership Input" type="insight" onPin={onPin} />
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
              <PinnableItem key={i} text={opp} category="White Space" type="opportunity" onPin={onPin} />
            ))}
          </ul>
        </div>
      )}
    </div>
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
