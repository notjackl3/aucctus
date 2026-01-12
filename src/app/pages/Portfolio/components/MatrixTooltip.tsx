/**
 * Matrix Tooltip Component
 *
 * Portal-based tooltip for priority matrix concept dots.
 * Uses React Portal to render outside parent container and avoid clipping.
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@libs/utils/react';

import type { PrioritizedConcept } from '../PortfolioPrioritization';

interface MatrixTooltipProps {
  concept: PrioritizedConcept;
  isVisible: boolean;
  mousePosition: { x: number; y: number };
}

const MatrixTooltip: React.FC<MatrixTooltipProps> = ({
  concept,
  isVisible,
  mousePosition,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 12;

    // Calculate position - offset from cursor
    let x = mousePosition.x + padding;
    let y = mousePosition.y + padding;

    // Keep tooltip within viewport
    if (x + tooltipRect.width > window.innerWidth - padding) {
      x = mousePosition.x - tooltipRect.width - padding;
    }
    if (y + tooltipRect.height > window.innerHeight - padding) {
      y = mousePosition.y - tooltipRect.height - padding;
    }

    setPosition({ x, y });
  }, [isVisible, mousePosition]);

  if (!isVisible) return null;

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className={cn(
        'aucctus-bg-primary aucctus-border-secondary pointer-events-none fixed z-[9999] rounded-lg border px-4 py-3 shadow-lg',
        'animate-in fade-in-0 zoom-in-95 duration-100',
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Title */}
      <h4 className='aucctus-text-sm-semibold aucctus-text-primary mb-2.5 max-w-[280px]'>
        {concept.title}
      </h4>

      {/* Scores */}
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between gap-4'>
          <span className='aucctus-text-xs aucctus-text-tertiary'>
            Strategic Alignment
          </span>
          <span className='aucctus-text-xs-semibold aucctus-text-primary'>
            {concept.strategicAlignmentScore}
          </span>
        </div>
        <div className='flex items-center justify-between gap-4'>
          <span className='aucctus-text-xs aucctus-text-tertiary'>
            Financial Opportunity
          </span>
          <span className='aucctus-text-xs-semibold aucctus-text-primary'>
            {concept.financialOpportunityScore}
          </span>
        </div>
        <div className='flex items-center justify-between gap-4'>
          <span className='aucctus-text-xs aucctus-text-tertiary'>
            Innovation Risk
          </span>
          <span className='aucctus-text-xs-semibold aucctus-text-primary'>
            {concept.innovationRiskScore}
          </span>
        </div>
        <div className='aucctus-border-secondary mt-2.5 flex items-center justify-between gap-4 border-t pt-2'>
          <span className='aucctus-text-xs-medium aucctus-text-secondary'>
            Overall Priority
          </span>
          <span className='aucctus-text-sm-bold aucctus-text-brand-primary'>
            {concept.overallPriorityScore}
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(tooltipContent, document.body);
};

export default MatrixTooltip;
