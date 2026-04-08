import { ChevronRight } from 'lucide-react';
import type { ConfidenceIndicator } from '../types/analysis';

export type CategoryStatus = 'validated' | 'uncertain' | 'needs-input';

function deriveStatus(confidence: ConfidenceIndicator | null): CategoryStatus {
  if (!confidence) return 'needs-input';
  if (confidence.level === 'high') return 'validated';
  if (confidence.level === 'low') return 'needs-input';
  return 'uncertain';
}

const statusConfig = {
  validated: { label: 'Validated', bg: 'bg-go-light', text: 'text-go', dot: 'bg-go' },
  uncertain: { label: 'Uncertain', bg: 'bg-maybe-light', text: 'text-maybe', dot: 'bg-maybe' },
  'needs-input': { label: 'Needs Input', bg: 'bg-nogo-light', text: 'text-nogo', dot: 'bg-nogo' },
};

interface Props {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  summary: string;
  stat?: string;
  confidence: ConfidenceIndicator | null;
  count?: number;
  countLabel?: string;
  active?: boolean;
  onClick: () => void;
}

export default function CategoryCard({
  icon: Icon,
  title,
  summary,
  stat,
  confidence,
  count,
  countLabel,
  active,
  onClick,
}: Props) {
  const status = deriveStatus(confidence);
  const sc = statusConfig[status];

  return (
    <button
      onClick={onClick}
      className={`group text-left w-full p-5 rounded-xl border transition-all ${
        active
          ? 'bg-surface border-brand/40 shadow-lg shadow-brand/5'
          : 'bg-surface border-border hover:border-brand/20 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <Icon size={16} className="text-brand" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors">
            {title}
          </h3>
        </div>
        <ChevronRight
          size={14}
          className={`shrink-0 mt-1 transition-colors ${
            active ? 'text-brand' : 'text-text-muted group-hover:text-brand'
          }`}
        />
      </div>

      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3">
        {summary}
      </p>

      <div className="flex items-center justify-between gap-2">
        {/* Status badge */}
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} text-xs font-medium`}>
          <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </div>

        <div className="flex items-center gap-3">
          {count !== undefined && (
            <span className="text-xs text-text-muted">
              {count} {countLabel || 'items'}
            </span>
          )}
          {stat && (
            <span className="text-xs text-text-muted">{stat}</span>
          )}
        </div>
      </div>
    </button>
  );
}
