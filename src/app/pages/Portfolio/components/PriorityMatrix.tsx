/**
 * Priority Matrix Component
 *
 * A 2x2 scatter plot visualization showing concepts positioned by:
 * - X-axis: Financial Opportunity Score (0-100, left to right)
 * - Y-axis: Innovation Risk Score (0-100, inverted - low risk at top)
 *
 * Quadrants:
 * - Top-right: High Priority (high opportunity, low risk) - GREEN
 * - Top-left: Low opportunity, low risk - YELLOW
 * - Bottom-right: High opportunity, high risk - YELLOW
 * - Bottom-left: Low Priority (low opportunity, high risk) - RED
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@libs/utils/react';

import MatrixTooltip from './MatrixTooltip';
import type { PrioritizedConcept } from '../PortfolioPrioritization';

interface PriorityMatrixProps {
  concepts: PrioritizedConcept[];
  selectedConceptUuid: string | null;
  onConceptClick: (conceptUuid: string) => void;
}

// Margins for axis labels
const MARGIN = { top: 20, right: 20, bottom: 50, left: 50 };
const DOT_SIZE = 12;
const SELECTED_DOT_SIZE = 16;

const PriorityMatrix: React.FC<PriorityMatrixProps> = ({
  concepts,
  selectedConceptUuid,
  onConceptClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredConcept, setHoveredConcept] =
    useState<PrioritizedConcept | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Measure container and update dimensions
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [updateDimensions]);

  // Calculate the actual plot area
  const plotWidth = Math.max(0, dimensions.width - MARGIN.left - MARGIN.right);
  const plotHeight = Math.max(
    0,
    dimensions.height - MARGIN.top - MARGIN.bottom,
  );

  // Calculate positions for each concept
  const positionedConcepts = useMemo(() => {
    if (plotWidth <= 0 || plotHeight <= 0) return [];

    return concepts.map((concept) => {
      // X position based on financial opportunity (0-100 -> left to right)
      const xPercent = concept.financialOpportunityScore / 100;
      const x = xPercent * plotWidth;

      // Y position based on innovation risk (inverted: 0 = bottom, 100 = top)
      // Low risk at top (high priority), high risk at bottom
      const yPercent = 1 - concept.innovationRiskScore / 100;
      const y = yPercent * plotHeight;

      // Determine quadrant color
      const isHighOpportunity = concept.financialOpportunityScore >= 50;
      const isLowRisk = concept.innovationRiskScore < 50;

      let quadrantColor: 'green' | 'yellow' | 'red';
      if (isHighOpportunity && isLowRisk) {
        quadrantColor = 'green'; // Top-right: Best
      } else if (!isHighOpportunity && !isLowRisk) {
        quadrantColor = 'red'; // Bottom-left: Worst
      } else {
        quadrantColor = 'yellow'; // Mixed
      }

      return {
        ...concept,
        x,
        y,
        quadrantColor,
      };
    });
  }, [concepts, plotWidth, plotHeight]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Don't render until we have dimensions
  if (dimensions.width === 0 || dimensions.height === 0) {
    return <div ref={containerRef} className='h-full w-full' />;
  }

  return (
    <div ref={containerRef} className='relative h-full w-full'>
      {/* Tooltip */}
      {hoveredConcept && (
        <MatrixTooltip
          concept={hoveredConcept}
          isVisible={!!hoveredConcept}
          mousePosition={mousePosition}
        />
      )}

      <svg
        width={dimensions.width}
        height={dimensions.height}
        className='overflow-visible'
        onMouseMove={handleMouseMove}
      >
        {/* Background quadrants */}
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Top-right: High Priority (green) */}
          <rect
            x={plotWidth / 2}
            y={0}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill='rgba(34, 197, 94, 0.08)'
            stroke='rgba(34, 197, 94, 0.2)'
            strokeWidth={1}
          />
          {/* Top-left: Low opportunity, low risk (yellow) */}
          <rect
            x={0}
            y={0}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill='rgba(234, 179, 8, 0.06)'
            stroke='rgba(234, 179, 8, 0.15)'
            strokeWidth={1}
          />
          {/* Bottom-right: High opportunity, high risk (yellow) */}
          <rect
            x={plotWidth / 2}
            y={plotHeight / 2}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill='rgba(234, 179, 8, 0.06)'
            stroke='rgba(234, 179, 8, 0.15)'
            strokeWidth={1}
          />
          {/* Bottom-left: Low Priority (red) */}
          <rect
            x={0}
            y={plotHeight / 2}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill='rgba(239, 68, 68, 0.06)'
            stroke='rgba(239, 68, 68, 0.15)'
            strokeWidth={1}
          />

          {/* Grid lines */}
          <line
            x1={plotWidth / 2}
            y1={0}
            x2={plotWidth / 2}
            y2={plotHeight}
            stroke='currentColor'
            strokeOpacity={0.15}
            strokeDasharray='4 4'
          />
          <line
            x1={0}
            y1={plotHeight / 2}
            x2={plotWidth}
            y2={plotHeight / 2}
            stroke='currentColor'
            strokeOpacity={0.15}
            strokeDasharray='4 4'
          />

          {/* Concept dots */}
          {positionedConcepts.map((concept) => {
            const isSelected = concept.conceptUuid === selectedConceptUuid;
            const isHovered =
              hoveredConcept?.conceptUuid === concept.conceptUuid;
            const size = isSelected ? SELECTED_DOT_SIZE : DOT_SIZE;

            const fillColor =
              concept.quadrantColor === 'green'
                ? '#22c55e'
                : concept.quadrantColor === 'yellow'
                  ? '#eab308'
                  : '#ef4444';

            return (
              <g
                key={concept.conceptUuid}
                transform={`translate(${concept.x}, ${concept.y})`}
                onClick={() => onConceptClick(concept.conceptUuid)}
                onMouseEnter={() => setHoveredConcept(concept)}
                onMouseLeave={() => setHoveredConcept(null)}
                className='cursor-pointer'
              >
                {/* Outer ring for selected */}
                {isSelected && (
                  <circle
                    r={size + 4}
                    fill='none'
                    stroke={fillColor}
                    strokeWidth={2}
                    opacity={0.5}
                  />
                )}
                {/* Main dot */}
                <circle
                  r={size / 2}
                  fill={fillColor}
                  stroke='white'
                  strokeWidth={2}
                  className={cn(
                    'transition-all duration-200',
                    isSelected || isHovered
                      ? 'drop-shadow-lg'
                      : 'hover:drop-shadow-md',
                  )}
                />
                {/* Hover trigger area */}
                <circle r={size} fill='transparent' />
              </g>
            );
          })}
        </g>

        {/* Y-axis label */}
        <text
          x={14}
          y={MARGIN.top + plotHeight / 2}
          textAnchor='middle'
          className='aucctus-text-xs fill-current opacity-60'
          transform={`rotate(-90, 14, ${MARGIN.top + plotHeight / 2})`}
        >
          ← Low Risk | High Risk →
        </text>

        {/* X-axis label */}
        <text
          x={MARGIN.left + plotWidth / 2}
          y={dimensions.height - 8}
          textAnchor='middle'
          className='aucctus-text-xs fill-current opacity-60'
        >
          ← Low Opportunity | High Opportunity →
        </text>

        {/* X-axis tick labels */}
        <text
          x={MARGIN.left}
          y={MARGIN.top + plotHeight + 22}
          textAnchor='middle'
          className='aucctus-text-xs fill-current opacity-40'
        >
          0
        </text>
        <text
          x={MARGIN.left + plotWidth / 2}
          y={MARGIN.top + plotHeight + 22}
          textAnchor='middle'
          className='aucctus-text-xs fill-current opacity-40'
        >
          50
        </text>
        <text
          x={MARGIN.left + plotWidth}
          y={MARGIN.top + plotHeight + 22}
          textAnchor='middle'
          className='aucctus-text-xs fill-current opacity-40'
        >
          100
        </text>

        {/* Y-axis tick labels */}
        <text
          x={MARGIN.left - 12}
          y={MARGIN.top + 4}
          textAnchor='end'
          className='aucctus-text-xs fill-current opacity-40'
        >
          0
        </text>
        <text
          x={MARGIN.left - 12}
          y={MARGIN.top + plotHeight / 2 + 4}
          textAnchor='end'
          className='aucctus-text-xs fill-current opacity-40'
        >
          50
        </text>
        <text
          x={MARGIN.left - 12}
          y={MARGIN.top + plotHeight + 4}
          textAnchor='end'
          className='aucctus-text-xs fill-current opacity-40'
        >
          100
        </text>
      </svg>
    </div>
  );
};

export default PriorityMatrix;
