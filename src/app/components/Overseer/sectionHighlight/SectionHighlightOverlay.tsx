import { useRoutePattern } from '@hooks/router.hook';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ACCOUNT_LEVEL_SECTIONS,
  resolveRouteForSection,
  resolveSectionElement,
} from './sectionMap';

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
  const setHighlightedSection = useStore(
    (state) => state.overseer.setHighlightedSection,
  );
  const [rect, setRect] = useState<OverlayRect | null>(null);
  const [visible, setVisible] = useState(false);
  const lastRectRef = useRef<OverlayRect | null>(null);
  const rafRef = useRef<number>(0);
  const prevSectionRef = useRef<string | null>(null);
  const autoClearRef = useRef<number>(0);

  // Keep a ref to the last known rect so exit animations can use it
  if (rect) lastRectRef.current = rect;
  const displayRect = rect ?? lastRectRef.current;

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
      setVisible(false);
      setRect(null);
      prevSectionRef.current = null;
      return;
    }

    // Account-level pages: navigate-only, no glow highlight
    if (ACCOUNT_LEVEL_SECTIONS.has(highlightedSectionId)) {
      const targetRoute = resolveRouteForSection(highlightedSectionId);
      if (targetRoute && currentRoute !== targetRoute) {
        navigate(targetRoute);
        // Clear after navigation settles to unblock the auto-close guard in Private.tsx
        setTimeout(() => setHighlightedSection(null), 500);
      } else {
        // Already on the right route — clear immediately
        setHighlightedSection(null);
      }
      setRect(null);
      prevSectionRef.current = highlightedSectionId;
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
          setVisible(true);

          // Auto-dismiss for dynamic UUID targets (nucleus deep-links).
          // IDs not in SECTION_TO_ROUTE are dynamic UUIDs — they should
          // auto-clear so the glow doesn't persist indefinitely.
          if (!targetRoute) {
            autoClearRef.current = window.setTimeout(
              () => setHighlightedSection(null),
              2000,
            );
          }
        } else {
          setRect(null);
        }
      },
      needsNavigation ? 300 : 100,
    );

    return () => {
      clearTimeout(timeout);
      if (autoClearRef.current) clearTimeout(autoClearRef.current);
    };
  }, [
    highlightedSectionId,
    updateRect,
    navigate,
    conceptId,
    currentRoute,
    setHighlightedSection,
  ]);

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

  // Viewport-relative cutout coordinates for the dim backdrop.
  // The backdrop is position:fixed so we need viewport-relative values
  // (i.e. the raw getBoundingClientRect values, not scroll-adjusted).
  const viewportCutout = React.useMemo(() => {
    if (!displayRect) return null;
    const pad = 8;
    const r = 12;
    return {
      x: displayRect.left - window.scrollX - pad,
      y: displayRect.top - window.scrollY - pad,
      w: displayRect.width + pad * 2,
      h: displayRect.height + pad * 2,
      r,
    };
  }, [displayRect]);

  return createPortal(
    <AnimatePresence>
      {visible && displayRect && viewportCutout && (
        <>
          {/* Full-page dim backdrop with SVG mask cutout */}
          <motion.div
            key='spotlight-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 49,
            }}
          >
            <svg width='100%' height='100%' style={{ display: 'block' }}>
              <defs>
                <mask id='spotlight-mask'>
                  {/* White = visible (dimmed area) */}
                  <rect width='100%' height='100%' fill='white' />
                  {/* Black = transparent (cutout hole) */}
                  <rect
                    x={viewportCutout.x}
                    y={viewportCutout.y}
                    width={viewportCutout.w}
                    height={viewportCutout.h}
                    rx={viewportCutout.r}
                    ry={viewportCutout.r}
                    fill='black'
                  />
                </mask>
              </defs>
              <rect
                width='100%'
                height='100%'
                fill='rgba(0, 0, 0, 0.45)'
                mask='url(#spotlight-mask)'
              />
            </svg>
          </motion.div>
          {/* Crimson glow ring around the highlighted element */}
          <motion.div
            key='spotlight-glow'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              top: displayRect.top - 8,
              left: displayRect.left - 8,
              width: displayRect.width + 16,
              height: displayRect.height + 16,
              pointerEvents: 'none',
              zIndex: 50,
              borderRadius: 12,
              boxShadow:
                '0 0 20px rgba(163,13,19,0.18), 0 0 8px rgba(151,45,85,0.14), inset 0 0 0 1.5px rgba(163,13,19,0.35)',
            }}
          />
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default SectionHighlightOverlay;
