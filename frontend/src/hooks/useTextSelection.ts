import { useState, useEffect, useCallback, useRef } from 'react';

export interface SelectionInfo {
  text: string;
  rect: DOMRect;
  blockId: string;
  blockCategory: string;
  blockLabel: string;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const scrollYRef = useRef(0);

  const handleMouseUp = useCallback(() => {
    // Small delay to let browser finalize selection
    requestAnimationFrame(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setSelection(null);
        return;
      }

      const text = sel.toString().trim();
      if (text.length < 3) {
        setSelection(null);
        return;
      }

      // Walk up from anchorNode to find [data-selectable-block]
      let node: Node | null = sel.anchorNode;
      let blockEl: HTMLElement | null = null;
      while (node) {
        if (node instanceof HTMLElement && node.dataset.selectableBlock) {
          blockEl = node;
          break;
        }
        node = node.parentNode;
      }

      if (!blockEl) {
        setSelection(null);
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      scrollYRef.current = window.scrollY;

      setSelection({
        text,
        rect,
        blockId: blockEl.dataset.selectableBlock!,
        blockCategory: blockEl.dataset.blockCategory || '',
        blockLabel: blockEl.dataset.blockLabel || '',
      });
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // Clear on significant scroll so toolbar doesn't float in wrong spot
  useEffect(() => {
    if (!selection) return;
    const onScroll = () => {
      if (Math.abs(window.scrollY - scrollYRef.current) > 50) {
        setSelection(null);
      }
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [selection]);

  return { selection, clearSelection };
}
