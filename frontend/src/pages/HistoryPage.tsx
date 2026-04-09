import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Loader2,
  AlertCircle,
  Calendar,
  ArrowRight,
  Search,
  Target,
  Clock,
  Trash2,
} from 'lucide-react';
import { listAnalyses, deleteAnalysis } from '../api/client';
import type { AnalysisSummary } from '../api/client';
import RecommendationBadge from '../components/RecommendationBadge';
import ScoreGauge from '../components/ScoreGauge';

type SortKey = 'date' | 'score' | 'company';
type FilterStatus = 'all' | 'completed' | 'running' | 'error';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    listAnalyses()
      .then(setAnalyses)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // failed silently — item stays in list
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-brand animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle size={40} className="text-nogo" />
        <h1 className="text-xl font-bold text-text-primary">Failed to Load History</h1>
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Filter and sort
  const filtered = analyses
    .filter((a) => {
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.companyName.toLowerCase().includes(q) ||
          a.marketSpace.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.score ?? 0) - (a.score ?? 0);
      if (sortBy === 'company') return a.companyName.localeCompare(b.companyName);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const statusCounts = {
    all: analyses.length,
    completed: analyses.filter((a) => a.status === 'completed').length,
    running: analyses.filter((a) => a.status === 'running' || a.status === 'pending').length,
    error: analyses.filter((a) => a.status === 'error').length,
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-5xl mx-auto px-8 pt-10 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <BarChart3 size={20} className="text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Analysis History</h1>
              <p className="text-sm text-text-secondary">
                {analyses.length} analysis {analyses.length === 1 ? 'run' : 'runs'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors flex items-center gap-2"
          >
            <Target size={14} />
            New Analysis
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by company or market..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1 bg-surface rounded-xl border border-border p-1">
            {(['all', 'completed', 'running', 'error'] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === s
                    ? 'bg-brand/10 text-brand'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {s === 'all' ? 'All' : s === 'completed' ? 'Completed' : s === 'running' ? 'In Progress' : 'Failed'}
                {statusCounts[s] > 0 && (
                  <span className="ml-1 text-text-muted">({statusCounts[s]})</span>
                )}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-3 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
          >
            <option value="date">Newest first</option>
            <option value="score">Highest score</option>
            <option value="company">Company A-Z</option>
          </select>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center">
            <BarChart3 size={40} className="text-text-muted mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              {analyses.length === 0 ? 'No analyses yet' : 'No matching analyses'}
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {analyses.length === 0
                ? 'Run your first competitive landscape analysis to see it here.'
                : 'Try adjusting your search or filters.'}
            </p>
            {analyses.length === 0 && (
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
              >
                Start First Analysis
              </button>
            )}
          </div>
        )}

        {/* Analysis list */}
        <div className="space-y-3">
          {filtered.map((a) => (
            <AnalysisCard
              key={a.id}
              analysis={a}
              navigate={navigate}
              onDelete={handleDelete}
              isDeleting={deleting === a.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({
  analysis: a,
  navigate,
  onDelete,
  isDeleting,
}: {
  analysis: AnalysisSummary;
  navigate: ReturnType<typeof useNavigate>;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const isCompleted = a.status === 'completed';
  const isRunning = a.status === 'running' || a.status === 'pending';
  const isError = a.status === 'error';

  const handleClick = () => {
    if (isDeleting) return;
    if (isCompleted) {
      navigate(`/workspace/${a.id}`);
    } else if (isRunning) {
      navigate(`/analysis/${a.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    onDelete(a.id);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div
      onClick={handleClick}
      className={`relative w-full text-left p-5 rounded-xl bg-surface border transition-all group ${
        isError
          ? 'border-nogo/20 opacity-70'
          : isDeleting
            ? 'border-border opacity-50 pointer-events-none'
            : 'border-border hover:border-brand/30 hover:shadow-sm cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-5">
        {/* Left: Score gauge or status indicator */}
        <div className="shrink-0">
          {isCompleted && a.score != null ? (
            <ScoreGauge score={a.score} size="sm" />
          ) : isRunning ? (
            <div className="w-16 h-16 rounded-full border-2 border-brand/30 flex items-center justify-center">
              <Loader2 size={20} className="text-brand animate-spin" />
            </div>
          ) : isError ? (
            <div className="w-16 h-16 rounded-full border-2 border-nogo/30 flex items-center justify-center">
              <AlertCircle size={20} className="text-nogo" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full border-2 border-border flex items-center justify-center">
              <Clock size={20} className="text-text-muted" />
            </div>
          )}
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <h3 className="text-base font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
              {a.companyName}
            </h3>
            {isRunning && (
              <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-medium">
                Running
              </span>
            )}
            {isError && (
              <span className="px-2 py-0.5 rounded-full bg-nogo/10 text-nogo text-xs font-medium">
                Failed
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary truncate">{a.marketSpace}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <Calendar size={12} />
              {formatDate(a.createdAt)}
              {' at '}
              {formatTime(a.createdAt)}
            </span>
          </div>
        </div>

        {/* Right: Delete + Arrow */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="p-2 rounded-lg text-text-muted hover:text-nogo hover:bg-nogo/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
            title="Delete analysis"
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
          {!isError && (
            <ArrowRight
              size={18}
              className="text-text-muted group-hover:text-brand transition-colors"
            />
          )}
        </div>
      </div>
    </div>
  );
}
