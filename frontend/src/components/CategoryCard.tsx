import { ChevronRight } from 'lucide-react';
import type { ConfidenceIndicator } from '../types/analysis';

export type CategoryStatus = 'high-confidence' | 'uncertain' | 'weak-evidence';

function deriveStatus(confidence: ConfidenceIndicator | null): CategoryStatus {
  if (!confidence) return 'weak-evidence';
  if (confidence.level === 'high') return 'high-confidence';
  if (confidence.level === 'low') return 'weak-evidence';
  return 'uncertain';
}

const statusConfig = {
  'high-confidence': { label: 'High Confidence', bg: 'bg-go-light', text: 'text-go', dot: 'bg-go' },
  uncertain: { label: 'Uncertain', bg: 'bg-maybe-light', text: 'text-maybe', dot: 'bg-maybe' },
  'weak-evidence': { label: 'Weak Evidence', bg: 'bg-nogo-light', text: 'text-nogo', dot: 'bg-nogo' },
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
      className={`group text-left w-full p-4 rounded-xl border transition-all ${
        active
          ? 'bg-surface border-brand/40 shadow-lg shadow-brand/5'
          : 'bg-surface border-border hover:border-brand/20 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <Icon size={14} className="text-brand" />
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

      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-2.5">
        {summary}
      </p>

      <div className="flex items-center justify-between gap-2">
        {/* Status badge */}
        {confidence && (
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} text-[10px] font-semibold`}>
            <div className={`w-1 h-1 rounded-full ${sc.dot}`} />
            {sc.label}
          </div>
        )}
        {!confidence && <div />}

        <div className="flex items-center gap-3">
          {count !== undefined && (
            <span className="text-[10px] text-text-muted font-medium">
              {count} {countLabel || 'items'}
            </span>
          )}
          {stat && (
            <span className="text-[10px] text-text-muted font-medium">{stat}</span>
          )}
        </div>
      </div>
    </button>
  );
}
