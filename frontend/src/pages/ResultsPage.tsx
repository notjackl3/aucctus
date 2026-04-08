import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  Rocket,
  TrendingUp,
  Lightbulb,
  ThumbsUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Target,
  DollarSign,
  Globe,
  Calendar,
  Users,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getAnalysis } from '../api/client';
import type { AnalysisResult } from '../types/analysis';
import ScoreGauge from '../components/ScoreGauge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import SourceCard from '../components/SourceCard';
import RecommendationBadge from '../components/RecommendationBadge';

type BelieveTab = 'believe' | 'challenge';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setError('No analysis ID'); setLoading(false); return; }
    getAnalysis(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load results'))
      .finally(() => setLoading(false));
  }, [id]);

  const [believeTab, setBelieveTab] = useState<BelieveTab>('believe');
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  const togglePlayer = (name: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

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
        <h1 className="text-xl font-bold text-white">Failed to Load Results</h1>
        <p className="text-sm text-text-secondary">{error || 'Unknown error'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const assessment = data.opportunityAssessment;
  const incumbents = data.incumbents;
  const emerging = data.emergingCompetitors;
  const market = data.marketSizing;

  if (!assessment || !incumbents || !emerging || !market) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle size={40} className="text-maybe" />
        <h1 className="text-xl font-bold text-white">Analysis Incomplete</h1>
        <p className="text-sm text-text-secondary">Some research sections are not yet available.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-8 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {data.request.companyName}
                </h1>
                <RecommendationBadge recommendation={assessment.recommendation} />
              </div>
              <p className="text-sm text-text-secondary">{data.request.marketSpace}</p>
            </div>
          </div>
          <div className="text-xs text-text-muted">
            Completed {new Date(data.completedAt!).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 pb-8 space-y-8">
        {/* ── Opportunity Assessment (Hero) ── */}
        <section className="bg-surface rounded-2xl border border-border p-8">
          <div className="flex items-start gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={18} className="text-brand" />
                <h2 className="text-base font-semibold text-text-primary uppercase tracking-wide">
                  Opportunity Assessment
                </h2>
              </div>
              <RecommendationBadge recommendation={assessment.recommendation} size="lg" />
              <p className="text-base text-text-primary font-medium mt-5 leading-relaxed">
                {assessment.headline}
              </p>
              <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                {assessment.reasoning}
              </p>
              <div className="mt-4">
                <ConfidenceBadge confidence={assessment.confidence} showReasoning />
              </div>
            </div>
            <div className="shrink-0">
              <ScoreGauge score={assessment.score} size="lg" label="Opportunity Score" />
            </div>
          </div>

          {/* Reasons to Believe / Challenge tabs */}
          <div className="mt-8 border-t border-border pt-6">
            <div className="flex gap-0 mb-4 border-b border-border">
              <button
                onClick={() => setBelieveTab('believe')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  believeTab === 'believe'
                    ? 'border-go text-go'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                <ThumbsUp size={14} />
                Reasons to Believe
              </button>
              <button
                onClick={() => setBelieveTab('challenge')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  believeTab === 'challenge'
                    ? 'border-maybe text-maybe'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                <AlertTriangle size={14} />
                Reasons to Challenge
              </button>
            </div>
            <ul className="space-y-2.5">
              {(believeTab === 'believe'
                ? assessment.reasonsToBelieve
                : assessment.reasonsToChallenge
              ).map((reason, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      believeTab === 'believe' ? 'bg-go' : 'bg-maybe'
                    }`}
                  />
                  <span className="text-sm text-text-secondary leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* White space */}
          {assessment.whiteSpaceOpportunities.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Target size={14} className="text-brand" />
                White Space Opportunities
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {assessment.whiteSpaceOpportunities.map((opp, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-brand-light/50 border border-brand/10 text-sm text-text-secondary"
                  >
                    {opp}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Incumbents ── */}
        <section className="bg-surface rounded-2xl border border-border p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-brand" />
              <h2 className="text-base font-semibold text-text-primary uppercase tracking-wide">
                Incumbents
              </h2>
            </div>
            <ConfidenceBadge confidence={incumbents.confidence} />
          </div>

          <p className="text-sm text-text-secondary leading-relaxed mb-2">{incumbents.summary}</p>
          <p className="text-xs text-text-muted mb-6">
            <strong>Market concentration:</strong> {incumbents.marketConcentration}
          </p>

          {/* Player cards */}
          <div className="space-y-3">
            {incumbents.players.map((player) => {
              const expanded = expandedPlayers.has(player.name);
              return (
                <div
                  key={player.name}
                  className="border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => togglePlayer(player.name)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
                  >
                    {expanded ? (
                      <ChevronDown size={16} className="text-text-muted shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-text-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">
                          {player.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            player.marketPosition === 'Leader'
                              ? 'bg-go-light text-go'
                              : 'bg-white/10 text-text-secondary'
                          }`}
                        >
                          {player.marketPosition}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        {player.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {player.estimatedRevenue && (
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <DollarSign size={12} />
                          {player.estimatedRevenue}
                        </div>
                      )}
                      {player.founded && (
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <Calendar size={12} />
                          {player.founded}
                        </div>
                      )}
                    </div>
                  </button>
                  {expanded && (
                    <div className="px-5 pb-5 pt-0 border-t border-border-light">
                      <div className="grid grid-cols-2 gap-6 mt-4">
                        <div>
                          <h4 className="text-xs font-semibold text-go mb-2 uppercase tracking-wide">
                            Strengths
                          </h4>
                          <ul className="space-y-1.5">
                            {player.strengths.map((s, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-text-secondary"
                              >
                                <div className="w-1 h-1 rounded-full bg-go mt-1.5 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-nogo mb-2 uppercase tracking-wide">
                            Weaknesses
                          </h4>
                          <ul className="space-y-1.5">
                            {player.weaknesses.map((w, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-text-secondary"
                              >
                                <div className="w-1 h-1 rounded-full bg-nogo mt-1.5 shrink-0" />
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {player.headquarters && (
                        <div className="flex items-center gap-1 text-xs text-text-muted mt-4">
                          <Globe size={12} />
                          {player.headquarters}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sources */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
              Sources
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {incumbents.sources.map((src, i) => (
                <SourceCard key={i} source={src} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Emerging Competitors ── */}
        <section className="bg-surface rounded-2xl border border-border p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Rocket size={18} className="text-brand" />
              <h2 className="text-base font-semibold text-text-primary uppercase tracking-wide">
                Emerging Competitors
              </h2>
            </div>
            <ConfidenceBadge confidence={emerging.confidence} />
          </div>

          <p className="text-sm text-text-secondary leading-relaxed mb-2">{emerging.summary}</p>

          {/* Key metrics */}
          <div className="flex gap-6 my-5">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-border">
              <DollarSign size={16} className="text-brand" />
              <div>
                <p className="text-lg font-bold text-text-primary">{emerging.totalFundingInSpace}</p>
                <p className="text-xs text-text-muted">Total Funding (18mo)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-border">
              <TrendingUp size={16} className="text-brand" />
              <div>
                <p className="text-lg font-bold text-text-primary capitalize">
                  {emerging.fundingTrend}
                </p>
                <p className="text-xs text-text-muted">Funding Trend</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-border">
              <Users size={16} className="text-brand" />
              <div>
                <p className="text-lg font-bold text-text-primary">
                  {emerging.competitors.length}
                </p>
                <p className="text-xs text-text-muted">Notable Startups</p>
              </div>
            </div>
          </div>

          {/* Competitor cards */}
          <div className="space-y-3">
            {emerging.competitors.map((comp) => (
              <div
                key={comp.name}
                className="border border-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-text-primary">{comp.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 font-medium">
                        {comp.fundingStage}
                      </span>
                      {comp.fundingAmount && (
                        <span className="text-xs text-text-muted">{comp.fundingAmount}</span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mb-2">{comp.description}</p>
                    <div className="bg-white/5 rounded-lg p-2.5 text-xs text-text-secondary">
                      <strong className="text-text-primary">Differentiator:</strong>{' '}
                      {comp.differentiator}
                    </div>
                  </div>
                </div>
                {comp.investors && comp.investors.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-text-muted">Investors:</span>
                    {comp.investors.map((inv) => (
                      <span
                        key={inv}
                        className="text-xs px-2 py-0.5 rounded bg-white/10 text-text-secondary"
                      >
                        {inv}
                      </span>
                    ))}
                    {comp.fundingDate && (
                      <span className="text-xs text-text-muted ml-auto">{comp.fundingDate}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sources */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
              Sources
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {emerging.sources.map((src, i) => (
                <SourceCard key={i} source={src} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Market Sizing ── */}
        <section className="bg-surface rounded-2xl border border-border p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-brand" />
              <h2 className="text-base font-semibold text-text-primary uppercase tracking-wide">
                Market Sizing
              </h2>
            </div>
            <ConfidenceBadge confidence={market.confidence} />
          </div>

          <p className="text-sm text-text-secondary leading-relaxed mb-6">{market.summary}</p>

          {/* Key figures */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'TAM', value: market.tam, sub: 'Total Addressable' },
              { label: 'SAM', value: market.sam, sub: 'Serviceable' },
              { label: 'SOM', value: market.som || 'N/A', sub: 'Obtainable' },
              { label: 'CAGR', value: market.cagr, sub: market.timeframe },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-4 rounded-xl bg-white/5 border border-border"
              >
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-text-primary mt-1">{item.value}</p>
                <p className="text-xs text-text-muted mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Drivers & Constraints */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-go uppercase tracking-wide mb-3">
                Growth Drivers
              </h3>
              <ul className="space-y-2">
                {market.growthDrivers.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-go mt-1.5 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-maybe uppercase tracking-wide mb-3">
                Constraints
              </h3>
              <ul className="space-y-2">
                {market.constraints.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-maybe mt-1.5 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sources */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
              Sources
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {market.sources.map((src, i) => (
                <SourceCard key={i} source={src} />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-brand hover:text-brand-dark font-medium transition-colors"
          >
            Run another analysis
          </button>
        </div>
      </div>
    </div>
  );
}
