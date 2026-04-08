import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { Recommendation } from '../types/analysis';

const config = {
  go: {
    icon: CheckCircle2,
    label: 'GO',
    bg: 'bg-go-light',
    text: 'text-go',
    border: 'border-go/30',
    ring: 'ring-go/20',
  },
  'no-go': {
    icon: XCircle,
    label: 'NO-GO',
    bg: 'bg-nogo-light',
    text: 'text-nogo',
    border: 'border-nogo/30',
    ring: 'ring-nogo/20',
  },
  maybe: {
    icon: AlertTriangle,
    label: 'MAYBE',
    bg: 'bg-maybe-light',
    text: 'text-maybe',
    border: 'border-maybe/30',
    ring: 'ring-maybe/20',
  },
};

interface Props {
  recommendation: Recommendation;
  size?: 'sm' | 'lg';
}

export default function RecommendationBadge({ recommendation, size = 'sm' }: Props) {
  const c = config[recommendation];
  const Icon = c.icon;

  if (size === 'lg') {
    return (
      <div
        className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl ${c.bg} ${c.text} border-2 ${c.border} ring-4 ${c.ring}`}
      >
        <Icon size={28} />
        <span className="text-2xl font-bold tracking-wide">{c.label}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${c.bg} ${c.text} border ${c.border} text-sm font-semibold`}
    >
      <Icon size={16} />
      <span>{c.label}</span>
    </div>
  );
}
