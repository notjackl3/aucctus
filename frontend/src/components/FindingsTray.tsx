import { useState } from 'react';
import { Pin, X, ChevronUp, ChevronDown } from 'lucide-react';

export interface PinnedFinding {
  id: string;
  text: string;
  category: string;
  type: 'belief' | 'challenge' | 'risk' | 'opportunity' | 'insight' | 'driver' | 'constraint';
}

const typeColors: Record<PinnedFinding['type'], string> = {
  belief: 'text-go',
  challenge: 'text-maybe',
  risk: 'text-nogo',
  opportunity: 'text-brand',
  insight: 'text-text-secondary',
  driver: 'text-go',
  constraint: 'text-maybe',
};

interface Props {
  findings: PinnedFinding[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function FindingsTray({ findings, onRemove, onClear }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (findings.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-20 right-0 z-40">
      <div className="max-w-5xl mx-auto px-8">
        <div className="bg-surface border border-border border-b-0 rounded-t-xl shadow-2xl">
          {/* Header */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Pin size={14} className="text-brand" />
              <span className="text-xs font-semibold text-text-primary">
                Pinned Findings ({findings.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="text-xs text-text-muted hover:text-nogo transition-colors"
              >
                Clear all
              </button>
              {collapsed ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
            </div>
          </button>

          {/* Findings list */}
          {!collapsed && (
            <div className="px-5 pb-4 max-h-48 overflow-y-auto space-y-1.5">
              {findings.map((f) => (
                <div
                  key={f.id}
                  className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/5 group"
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${typeColors[f.type].replace('text-', 'bg-')}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary leading-relaxed">{f.text}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{f.category}</p>
                  </div>
                  <button
                    onClick={() => onRemove(f.id)}
                    className="shrink-0 p-0.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-text-muted" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
