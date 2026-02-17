import { useRoutePattern } from '@hooks/router.hook';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { resolveRouteForSection, resolveSectionElement } from './sectionMap';

interface OverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SectionHighlightOverlay: React.FC = () => {
  const highlightedSectionId = useStore(
    (state) => state.overseer.highlightedSectionId,
  );
  const [rect, setRect] = useState<OverlayRect | null>(null);
  const rafRef = useRef<number>(0);
  const prevSectionRef = useRef<string | null>(null);

  const navigate = useNavigate();
  const { id: conceptId } = useParams();
  const currentRoute = useRoutePattern();

  const updateRect = useCallback(() => {
    if (!highlightedSectionId) {
      setRect(null);
      return;
    }

    const el = resolveSectionElement(highlightedSectionId);
    if (!el) {
      setRect(null);
      return;
    }

    const domRect = el.getBoundingClientRect();
    setRect({
      top: domRect.top + window.scrollY,
      left: domRect.left + window.scrollX,
      width: domRect.width,
      height: domRect.height,
    });
  }, [highlightedSectionId]);

  // Scroll into view + update rect when highlighted section changes
  useEffect(() => {
    if (!highlightedSectionId) {
      setRect(null);
      prevSectionRef.current = null;
      return;
    }

    const targetRoute = resolveRouteForSection(highlightedSectionId);
    const needsNavigation =
      targetRoute && currentRoute !== targetRoute && conceptId;

    if (needsNavigation) {
      navigate(targetRoute.replace(':id', conceptId));
    }

    // Delay DOM query to allow tab switches / renders to settle
    const timeout = setTimeout(
      () => {
        const el = resolveSectionElement(highlightedSectionId);
        if (el) {
          // Only scroll if the section actually changed
          if (prevSectionRef.current !== highlightedSectionId) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          prevSectionRef.current = highlightedSectionId;
          updateRect();
        } else {
          setRect(null);
        }
      },
      needsNavigation ? 300 : 100,
    );

    return () => clearTimeout(timeout);
  }, [highlightedSectionId, updateRect, navigate, conceptId, currentRoute]);

  // Keep position updated on scroll/resize via RAF-throttled listener
  useEffect(() => {
    if (!highlightedSectionId) return;

    const handleUpdate = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRect);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    // ResizeObserver for the target element
    let resizeObserver: ResizeObserver | undefined;
    const el = resolveSectionElement(highlightedSectionId);
    if (el) {
      resizeObserver = new ResizeObserver(handleUpdate);
      resizeObserver.observe(el);
    }

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver?.disconnect();
    };
  }, [highlightedSectionId, updateRect]);

  return createPortal(
    <AnimatePresence>
      {rect && (
        <motion.div
          key={highlightedSectionId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            pointerEvents: 'none',
            zIndex: 50,
            borderRadius: 12,
            boxShadow:
              '0 0 20px rgba(163,13,19,0.18), 0 0 8px rgba(151,45,85,0.14), inset 0 0 0 1.5px rgba(163,13,19,0.35)',
          }}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default SectionHighlightOverlay;
