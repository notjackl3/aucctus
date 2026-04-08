import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Rocket,
  TrendingUp,
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
import type { AnalysisResult, IncumbentsResult, EmergingCompetitorsResult, MarketSizingResult } from '../types/analysis';
import ConfidenceBadge from '../components/ConfidenceBadge';
import SourceCard from '../components/SourceCard';

type SectionKey = 'incumbents' | 'emerging' | 'market';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const focusSection = searchParams.get('section') as SectionKey | null;

  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Which sections are expanded
  const [expanded, setExpanded] = useState<Set<SectionKey>>(
    focusSection && focusSection !== 'all' ? new Set([focusSection]) : new Set()
  );
  // Which players are expanded within incumbents
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  // Show all sources per section or just first 2
  const [showAllSources, setShowAllSources] = useState<Set<SectionKey>>(new Set());

  useEffect(() => {
    if (!id) { setError('No analysis ID'); setLoading(false); return; }
    getAnalysis(id)
      .then((result) => {
        setData(result);
        // If no focus section, expand all
        if (!focusSection) {
          setExpanded(new Set(['incumbents', 'emerging', 'market']));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, focusSection]);

  const toggleSection = (key: SectionKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const togglePlayer = (name: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const toggleSources = (key: SectionKey) => {
    setShowAllSources((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
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
        <h1 className="text-xl font-bold text-white">Failed to Load</h1>
        <p className="text-sm text-text-secondary">{error || 'Unknown error'}</p>
        <button onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors">
          Back to Home
        </button>
      </div>
    );
  }

  const incumbents = data.incumbents;
  const emerging = data.emergingCompetitors;
  const market = data.marketSizing;

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-8 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/cockpit/${id}`)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
              title="Back to summary">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{data.request.companyName}</h1>
              <p className="text-sm text-text-secondary">{data.request.marketSpace} — Research Details</p>
            </div>
          </div>
          <button onClick={() => navigate(`/cockpit/${id}`)}
            className="text-xs text-brand hover:text-brand-dark font-medium transition-colors">
            Back to Summary
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 pb-8 space-y-4">
        {/* ── Incumbents ── */}
        {incumbents && (
          <SectionShell
            sectionKey="incumbents"
            icon={Building2}
            title="Incumbents"
            summary={incumbents.summary}
            stat={`${incumbents.players.length} players · ${incumbents.marketConcentration}`}
            confidence={incumbents.confidence}
            expanded={expanded.has('incumbents')}
            onToggle={() => toggleSection('incumbents')}
          >
            <IncumbentsDetail
              data={incumbents}
              expandedPlayers={expandedPlayers}
              togglePlayer={togglePlayer}
              showAllSources={showAllSources.has('incumbents')}
              toggleSources={() => toggleSources('incumbents')}
            />
          </SectionShell>
        )}

        {/* ── Emerging Competitors ── */}
        {emerging && (
          <SectionShell
            sectionKey="emerging"
            icon={Rocket}
            title="Emerging Competitors"
            summary={emerging.summary}
            stat={`${emerging.competitors.length} startups · ${emerging.totalFundingInSpace} funding`}
            confidence={emerging.confidence}
            expanded={expanded.has('emerging')}
            onToggle={() => toggleSection('emerging')}
          >
            <EmergingDetail
              data={emerging}
              showAllSources={showAllSources.has('emerging')}
              toggleSources={() => toggleSources('emerging')}
            />
          </SectionShell>
        )}

        {/* ── Market Sizing ── */}
        {market && (
          <SectionShell
            sectionKey="market"
            icon={TrendingUp}
            title="Market Sizing"
            summary={market.summary}
            stat={`TAM ${market.tam} · CAGR ${market.cagr}`}
            confidence={market.confidence}
            expanded={expanded.has('market')}
            onToggle={() => toggleSection('market')}
          >
            <MarketDetail
              data={market}
              showAllSources={showAllSources.has('market')}
              toggleSources={() => toggleSources('market')}
            />
          </SectionShell>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-6 py-4">
          <button onClick={() => navigate(`/cockpit/${id}`)}
            className="text-sm text-brand hover:text-brand-dark font-medium transition-colors">
            Back to Decision Summary
          </button>
          <span className="text-text-muted">·</span>
          <button onClick={() => navigate('/')}
            className="text-sm text-text-muted hover:text-text-secondary font-medium transition-colors">
            Run another analysis
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Section Shell (collapsible wrapper) ──

function SectionShell({ sectionKey, icon: Icon, title, summary, stat, confidence, expanded, onToggle, children }: {
  sectionKey: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  summary: string;
  stat: string;
  confidence: { level: 'high' | 'medium' | 'low'; score: number; reasoning: string };
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface rounded-2xl border border-border overflow-hidden">
      {/* Clickable header */}
      <button onClick={onToggle}
        className="w-full flex items-center gap-4 px-8 py-5 text-left hover:bg-white/[0.02] transition-colors">
        {expanded
          ? <ChevronDown size={18} className="text-text-muted shrink-0" />
          : <ChevronRight size={18} className="text-text-muted shrink-0" />
        }
        <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{title}</h2>
            <ConfidenceBadge confidence={confidence} />
          </div>
          {!expanded && (
            <p className="text-xs text-text-muted mt-1 truncate">{stat}</p>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-8 pb-8 pt-0 border-t border-border">
          <p className="text-sm text-text-secondary leading-relaxed mt-5 mb-4">{summary}</p>
          <p className="text-xs text-text-muted mb-6">{stat}</p>
          {children}
        </div>
      )}
    </section>
  );
}


// ── Sources helper ──

function SourcesBlock({ sources, showAll, onToggle }: {
  sources: { title: string; url: string; publisher: string; date?: string; snippet?: string }[];
  showAll: boolean;
  onToggle: () => void;
}) {
  const visible = showAll ? sources : sources.slice(0, 2);
  return (
    <div className="mt-6 pt-4 border-t border-border">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
        Sources ({sources.length})
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {visible.map((src, i) => (
          <SourceCard key={i} source={src} />
        ))}
      </div>
      {sources.length > 2 && (
        <button onClick={onToggle}
          className="mt-3 text-xs text-brand hover:text-brand-dark font-medium transition-colors">
          {showAll ? 'Show fewer sources' : `Show all ${sources.length} sources`}
        </button>
      )}
    </div>
  );
}


// ── Incumbents Detail ──

function IncumbentsDetail({ data, expandedPlayers, togglePlayer, showAllSources, toggleSources }: {
  data: IncumbentsResult;
  expandedPlayers: Set<string>;
  togglePlayer: (name: string) => void;
  showAllSources: boolean;
  toggleSources: () => void;
}) {
  return (
    <>
      <div className="space-y-3">
        {data.players.map((player) => {
          const isExpanded = expandedPlayers.has(player.name);
          return (
            <div key={player.name} className="border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePlayer(player.name)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors">
                {isExpanded
                  ? <ChevronDown size={16} className="text-text-muted shrink-0" />
                  : <ChevronRight size={16} className="text-text-muted shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{player.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      player.marketPosition === 'Leader' ? 'bg-go-light text-go' : 'bg-white/10 text-text-secondary'
                    }`}>{player.marketPosition}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{player.description}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {player.estimatedRevenue && (
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <DollarSign size={12} />{player.estimatedRevenue}
                    </div>
                  )}
                  {player.founded && (
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Calendar size={12} />{player.founded}
                    </div>
                  )}
                </div>
              </button>
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-border-light">
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div>
                      <h4 className="text-xs font-semibold text-go mb-2 uppercase tracking-wide">Strengths</h4>
                      <ul className="space-y-1.5">
                        {player.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                            <div className="w-1 h-1 rounded-full bg-go mt-1.5 shrink-0" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-nogo mb-2 uppercase tracking-wide">Weaknesses</h4>
                      <ul className="space-y-1.5">
                        {player.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                            <div className="w-1 h-1 rounded-full bg-nogo mt-1.5 shrink-0" />{w}
                          </li>
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
      </div>
      <SourcesBlock sources={data.sources} showAll={showAllSources} onToggle={toggleSources} />
    </>
  );
}


// ── Emerging Competitors Detail ──

function EmergingDetail({ data, showAllSources, toggleSources }: {
  data: EmergingCompetitorsResult;
  showAllSources: boolean;
  toggleSources: () => void;
}) {
  return (
    <>
      {/* Key metrics */}
      <div className="flex gap-6 mb-5">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-border">
          <DollarSign size={16} className="text-brand" />
          <div>
            <p className="text-lg font-bold text-text-primary">{data.totalFundingInSpace}</p>
            <p className="text-xs text-text-muted">Total Funding (18mo)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-border">
          <TrendingUp size={16} className="text-brand" />
          <div>
            <p className="text-lg font-bold text-text-primary capitalize">{data.fundingTrend}</p>
            <p className="text-xs text-text-muted">Funding Trend</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-border">
          <Users size={16} className="text-brand" />
          <div>
            <p className="text-lg font-bold text-text-primary">{data.competitors.length}</p>
            <p className="text-xs text-text-muted">Notable Startups</p>
          </div>
        </div>
      </div>

      {/* Competitor cards */}
      <div className="space-y-3">
        {data.competitors.map((comp) => (
          <div key={comp.name} className="border border-border rounded-xl p-5">
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
                  <strong className="text-text-primary">Differentiator:</strong> {comp.differentiator}
                </div>
              </div>
            </div>
            {comp.investors && comp.investors.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-text-muted">Investors:</span>
                {comp.investors.map((inv) => (
                  <span key={inv} className="text-xs px-2 py-0.5 rounded bg-white/10 text-text-secondary">{inv}</span>
                ))}
                {comp.fundingDate && (
                  <span className="text-xs text-text-muted ml-auto">{comp.fundingDate}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <SourcesBlock sources={data.sources} showAll={showAllSources} onToggle={toggleSources} />
    </>
  );
}


// ── Market Sizing Detail ──

function MarketDetail({ data, showAllSources, toggleSources }: {
  data: MarketSizingResult;
  showAllSources: boolean;
  toggleSources: () => void;
}) {
  return (
    <>
      {/* Key figures */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'TAM', value: data.tam, sub: 'Total Addressable' },
          { label: 'SAM', value: data.sam, sub: 'Serviceable' },
          { label: 'SOM', value: data.som || 'N/A', sub: 'Obtainable' },
          { label: 'CAGR', value: data.cagr, sub: data.timeframe },
        ].map((item) => (
          <div key={item.label} className="text-center p-4 rounded-xl bg-white/5 border border-border">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{item.label}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{item.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Drivers & Constraints */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-semibold text-go uppercase tracking-wide mb-3">Growth Drivers</h3>
          <ul className="space-y-2">
            {data.growthDrivers.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-go mt-1.5 shrink-0" />{d}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-maybe uppercase tracking-wide mb-3">Constraints</h3>
          <ul className="space-y-2">
            {data.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-maybe mt-1.5 shrink-0" />{c}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <SourcesBlock sources={data.sources} showAll={showAllSources} onToggle={toggleSources} />
    </>
  );
}
