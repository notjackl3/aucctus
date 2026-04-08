import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  Rocket,
  TrendingUp,
  ThumbsUp,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Target,
  Loader2,
  AlertCircle,
  Shield,
  Eye,
} from 'lucide-react';
import { getAnalysis } from '../api/client';
import type { AnalysisResult } from '../types/analysis';
import ScoreGauge from '../components/ScoreGauge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import RecommendationBadge from '../components/RecommendationBadge';

type BelieveTab = 'believe' | 'challenge';

export default function CockpitPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [believeTab, setBelieveTab] = useState<BelieveTab>('believe');

  useEffect(() => {
    if (!id) { setError('No analysis ID'); setLoading(false); return; }
    getAnalysis(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

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
        <h1 className="text-xl font-bold text-white">Failed to Load</h1>
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

  if (!assessment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle size={40} className="text-maybe" />
        <h1 className="text-xl font-bold text-white">Analysis Incomplete</h1>
        <p className="text-sm text-text-secondary">The opportunity assessment is not available yet.</p>
        <button onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors">
          Back to Home
        </button>
      </div>
    );
  }

  // Derive the "biggest unknown" from key risks or low-confidence sections
  const biggestUnknown = assessment.keyRisks?.[0] || assessment.reasonsToChallenge?.[0] || null;

  const explorationPaths = [
    ...(incumbents ? [{
      key: 'incumbents',
      icon: Building2,
      title: 'Explore Incumbents',
      subtitle: `${incumbents.players.length} established players analyzed`,
      detail: incumbents.summary.slice(0, 100) + '...',
      confidence: incumbents.confidence,
    }] : []),
    ...(emerging ? [{
      key: 'emerging',
      icon: Rocket,
      title: 'Explore Emerging Competitors',
      subtitle: `${emerging.competitors.length} startups · ${emerging.totalFundingInSpace} funding`,
      detail: emerging.summary.slice(0, 100) + '...',
      confidence: emerging.confidence,
    }] : []),
    ...(market ? [{
      key: 'market',
      icon: TrendingUp,
      title: 'Explore Market Sizing',
      subtitle: `TAM ${market.tam} · CAGR ${market.cagr}`,
      detail: market.summary.slice(0, 100) + '...',
      confidence: market.confidence,
    }] : []),
    {
      key: 'all',
      icon: Eye,
      title: 'View Full Report',
      subtitle: 'All sections, sources, and evidence',
      detail: 'See the complete analysis with all research details.',
      confidence: null,
    },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-8 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')}
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{data.request.companyName}</h1>
                <RecommendationBadge recommendation={assessment.recommendation} />
              </div>
              <p className="text-sm text-text-secondary">{data.request.marketSpace}</p>
            </div>
          </div>
          {data.completedAt && (
            <div className="text-xs text-text-muted">
              {new Date(data.completedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 pb-8 space-y-6">
        {/* ── Decision Hero ── */}
        <section className="bg-surface rounded-2xl border border-border p-8">
          <div className="flex items-start gap-8">
            <div className="flex-1">
              <RecommendationBadge recommendation={assessment.recommendation} size="lg" />
              <p className="text-lg text-text-primary font-medium mt-5 leading-relaxed">
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
        </section>

        {/* ── Key Signals (believe / challenge / unknown) ── */}
        <section className="bg-surface rounded-2xl border border-border p-6">
          {/* Tabs */}
          <div className="flex gap-0 mb-4 border-b border-border">
            <button onClick={() => setBelieveTab('believe')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                believeTab === 'believe'
                  ? 'border-go text-go'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}>
              <ThumbsUp size={14} />
              Reasons to Believe ({assessment.reasonsToBelieve.length})
            </button>
            <button onClick={() => setBelieveTab('challenge')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                believeTab === 'challenge'
                  ? 'border-maybe text-maybe'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}>
              <AlertTriangle size={14} />
              Reasons to Challenge ({assessment.reasonsToChallenge.length})
            </button>
          </div>
          <ul className="space-y-2.5">
            {(believeTab === 'believe'
              ? assessment.reasonsToBelieve
              : assessment.reasonsToChallenge
            ).map((reason, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  believeTab === 'believe' ? 'bg-go' : 'bg-maybe'
                }`} />
                <span className="text-sm text-text-secondary leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>

          {/* Biggest unknown callout */}
          {biggestUnknown && (
            <div className="mt-5 pt-5 border-t border-border">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-border">
                <Shield size={18} className="text-maybe shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-maybe uppercase tracking-wide mb-1">Biggest Unknown</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{biggestUnknown}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── White Space Opportunities ── */}
        {assessment.whiteSpaceOpportunities.length > 0 && (
          <section className="bg-surface rounded-2xl border border-border p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Target size={14} className="text-brand" />
              White Space Opportunities
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {assessment.whiteSpaceOpportunities.map((opp, i) => (
                <div key={i}
                  className="p-3 rounded-lg bg-brand-light/50 border border-brand/10 text-sm text-text-secondary">
                  {opp}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Explore Further ── */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3 px-1">
            Explore the Research
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {explorationPaths.map((path) => {
              const Icon = path.icon;
              return (
                <button
                  key={path.key}
                  onClick={() => {
                    if (path.key === 'all') {
                      navigate(`/results/${id}`);
                    } else {
                      navigate(`/results/${id}?section=${path.key}`);
                    }
                  }}
                  className="group text-left p-5 rounded-xl bg-surface border border-border hover:border-brand/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                        <Icon size={16} className="text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors">
                          {path.title}
                        </p>
                        <p className="text-xs text-text-muted">{path.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-text-muted group-hover:text-brand transition-colors mt-1 shrink-0" />
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mt-1">{path.detail}</p>
                  {path.confidence && (
                    <div className="mt-3">
                      <ConfidenceBadge confidence={path.confidence} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-2">
          <button onClick={() => navigate('/')}
            className="text-sm text-brand hover:text-brand-dark font-medium transition-colors">
            Run another analysis
          </button>
        </div>
      </div>
    </div>
  );
}
