import { Pin, MessageCircleQuestion } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { SelectionInfo } from '../hooks/useTextSelection';

interface Props {
  selection: SelectionInfo;
  onPin: () => void;
  onAsk: () => void;
  onDismiss: () => void;
}

export default function SelectionToolbar({ selection, onPin, onAsk, onDismiss }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const { rect } = selection;
    const toolbarWidth = 180;
    const toolbarHeight = 40;
    const gap = 8;

    // fixed positioning = viewport-relative, no scrollY needed
    let top = rect.top - toolbarHeight - gap;
    let left = rect.left + rect.width / 2 - toolbarWidth / 2;

    // Keep within viewport
    if (left < 8) left = 8;
    if (left + toolbarWidth > window.innerWidth - 8) left = window.innerWidth - toolbarWidth - 8;
    if (top < 8) top = rect.bottom + gap;

    setPos({ top, left });
  }, [selection]);

  // Dismiss on mousedown outside — delay registration so the mouseup
  // that triggered the selection doesn't immediately dismiss
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (!mounted) return;
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          onDismiss();
        }
      };
      document.addEventListener('mousedown', handler);
      // Store cleanup
      cleanupRef.current = () => document.removeEventListener('mousedown', handler);
    }, 100);

    const cleanupRef = { current: () => {} };
    return () => {
      mounted = false;
      clearTimeout(timer);
      cleanupRef.current();
    };
  }, [onDismiss]);

  return (
    <div
      ref={ref}
      className="fixed z-50 flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white border border-border shadow-lg animate-in fade-in duration-150"
      style={{ top: pos.top, left: pos.left }}
    >
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onPin}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-primary hover:bg-gray-100 transition-colors"
      >
        <Pin size={12} className="text-brand" />
        Pin
      </button>
      <div className="w-px h-5 bg-border" />
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAsk}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-primary hover:bg-gray-100 transition-colors"
      >
        <MessageCircleQuestion size={12} className="text-brand" />
        Ask
      </button>
    </div>
  );
}
