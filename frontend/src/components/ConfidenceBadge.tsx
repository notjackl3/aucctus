import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { ConfidenceIndicator } from '../types/analysis';

const config = {
  high: {
    icon: ShieldCheck,
    bg: 'bg-go-light',
    text: 'text-go',
    border: 'border-go/20',
    label: 'High Confidence',
  },
  medium: {
    icon: Shield,
    bg: 'bg-maybe-light',
    text: 'text-maybe',
    border: 'border-maybe/20',
    label: 'Medium Confidence',
  },
  low: {
    icon: ShieldAlert,
    bg: 'bg-nogo-light',
    text: 'text-nogo',
    border: 'border-nogo/20',
    label: 'Low Confidence',
  },
};

interface Props {
  confidence: ConfidenceIndicator;
  showReasoning?: boolean;
}

export default function ConfidenceBadge({ confidence, showReasoning = false }: Props) {
  const c = config[confidence.level];
  const Icon = c.icon;

  return (
    <div className={`inline-flex flex-col gap-1.5`}>
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${c.bg} ${c.text} border ${c.border} text-xs font-medium`}
      >
        <Icon size={13} />
        <span>{c.label}</span>
        <span className="opacity-60">({confidence.score}%)</span>
      </div>
      {showReasoning && (
        <p className="text-xs text-text-muted leading-relaxed max-w-md">
          {confidence.reasoning}
        </p>
      )}
    </div>
  );
}
