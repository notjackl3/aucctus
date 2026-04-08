import { CheckCircle2, Loader2, Clock, AlertCircle } from 'lucide-react';
import type { ResearchStepStatus } from '../types/analysis';

const stepIcons = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle2,
  error: AlertCircle,
};

const stepStyles = {
  pending: {
    bg: 'bg-white/5',
    border: 'border-border',
    icon: 'text-text-muted',
    text: 'text-text-muted',
  },
  running: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-800',
    icon: 'text-blue-400',
    text: 'text-blue-400',
  },
  completed: {
    bg: 'bg-go-light',
    border: 'border-go/20',
    icon: 'text-go',
    text: 'text-go',
  },
  error: {
    bg: 'bg-nogo-light',
    border: 'border-nogo/20',
    icon: 'text-nogo',
    text: 'text-nogo',
  },
};

const statusLabels = {
  pending: 'Waiting',
  running: 'Researching...',
  completed: 'Complete',
  error: 'Error',
};

export default function StatusCard({ step }: { step: ResearchStepStatus }) {
  const Icon = stepIcons[step.status];
  const style = stepStyles[step.status];

  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${style.bg} ${style.border} transition-all`}
    >
      <Icon
        size={22}
        className={`${style.icon} ${step.status === 'running' ? 'animate-spin' : ''}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">{step.label}</p>
        <p className={`text-xs ${style.text} mt-0.5`}>{statusLabels[step.status]}</p>
      </div>
      {step.status === 'running' && (
        <div className="w-16 h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3" />
        </div>
      )}
    </div>
  );
}
