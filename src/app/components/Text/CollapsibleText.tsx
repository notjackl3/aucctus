import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import React from 'react';
import { ArrowDown } from 'lucide-react';

interface TitleDescriptionProps {
  title: string;
  titleClassName?: string;
  description: string;
  // Note: trying to set the position of the description will not work as this is being enforced to ensure the animation works properly
  descriptionClassName?: string;
  maxDescriptionHeight?: number;
  truncationClassName?: string;
  // Override the outer container's class. Default fills the parent height
  // (`h-full min-h-full ... justify-center`) which is right for table cells
  // and equal-row grids, but creates apparent vertical padding when the
  // collapsible sits inside a tile that auto-sizes to taller siblings.
  containerClassName?: string;
  // Skip the bottom fade-out gradient on truncated content. Useful when the
  // tile has a custom background that the gradient's `from-inherit` doesn't
  // resolve cleanly against.
  disableTruncationGradient?: boolean;
}

// const MAX_DESCRIPTION_HEIGHT = 60;

const CollapsibleText: React.FC<TitleDescriptionProps> = ({
  title,
  titleClassName,
  description,
  descriptionClassName,
  maxDescriptionHeight = 'auto',
  truncationClassName = 'line-clamp-3',
  containerClassName,
  disableTruncationGradient = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [isTruncated, setIsTruncated] = React.useState(false);
  // Measured pixel height of the line-clamped (collapsed) text. Used as the
  // FROM/TO target on the height animation so both expand and collapse
  // interpolate between two pixel values rather than between a number and
  // 'auto' — Framer can't measure the 'auto' side without racing the
  // simultaneous className change that toggles `truncationClassName`.
  const [clampedHeight, setClampedHeight] = React.useState<number | null>(null);

  const [isHovered, setIsHovered] = React.useState(false);

  const textRef = React.useRef<HTMLSpanElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  // Measure both the line-clamped natural height and whether the content
  // overflows. Runs in a useLayoutEffect so we read DOM values after layout
  // but before paint. We force-apply the truncation classes for the duration
  // of the measurement so `clientHeight` reflects the clamped height even if
  // `open` was previously true.
  const measure = React.useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    const truncationClasses = truncationClassName.split(/\s+/).filter(Boolean);
    const wasMissing = truncationClasses.filter(
      (c) => !el.classList.contains(c),
    );
    if (wasMissing.length > 0) el.classList.add(...wasMissing);
    // Temporarily clear any inline height Framer may have set so the
    // measurement reflects the natural clamped height, not a leftover px value.
    const priorInlineHeight = el.style.height;
    el.style.height = '';
    const measuredClamped = el.clientHeight;
    const measuredFull = el.scrollHeight;
    el.style.height = priorInlineHeight;
    if (wasMissing.length > 0) el.classList.remove(...wasMissing);
    setClampedHeight(measuredClamped);
    setIsTruncated(measuredFull > measuredClamped);
  }, [truncationClassName]);

  React.useLayoutEffect(() => {
    measure();
  }, [description, measure]);

  React.useEffect(() => {
    const handleResize = () => {
      measure();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [measure]);

  return (
    <span
      ref={containerRef}
      className={
        containerClassName ??
        'flex h-full min-h-full flex-col items-start justify-center gap-2 bg-inherit text-start align-middle'
      }
      onClick={() => isTruncated && setOpen((prev) => !prev)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={cn(
          'aucctus-text-primary aucctus-text-sm self-start',
          titleClassName,
        )}
      >
        {title}
      </span>
      <motion.span
        ref={textRef}
        className={cn(
          'aucctus-text-tertiary aucctus-text-sm self-start leading-tight',
          // Add word breaking and overflow handling to prevent horizontal overflow
          'hyphens-auto break-words',
          // The line-clamp class is applied unconditionally so the natural
          // (un-animated) height matches the clamped target. Framer's
          // height animation drives the visible expand/collapse.
          truncationClassName,
          { 'cursor-pointer': isTruncated },
          descriptionClassName,
          // This is to ensure relative is set and takes priority
          'relative',
        )}
        initial={false}
        animate={{
          height: open
            ? (textRef.current?.scrollHeight ?? clampedHeight ?? 'auto')
            : (clampedHeight ?? maxDescriptionHeight),
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          // Always clip overflow so the height animation controls visible
          // content. Without `overflow: hidden` the line-clamp would still
          // hide rows but the spring's overshoot could briefly reveal them.
          overflow: 'hidden',
          // Additional CSS properties for better text wrapping
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        }}
      >
        {description}
        {!open && isTruncated && (
          <>
            {!disableTruncationGradient && (
              <span className='pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-inherit to-transparent'></span>
            )}
            <span className='absolute inset-x-0 bottom-0 flex w-full justify-center'>
              {isHovered && (
                <button className='btn btn-light btn-xs mb-1'>
                  See More <ArrowDown />
                </button>
              )}
            </span>
          </>
        )}
      </motion.span>
    </span>
  );
};

export default CollapsibleText;
