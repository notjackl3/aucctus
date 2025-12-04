import { FunctionComponent, ReactNode } from 'react';

export interface BorderTraceWrapperProps {
  /**
   * Whether to show the border trace animation
   */
  isActive: boolean;
  /**
   * Content to wrap with the border trace
   */
  children: ReactNode;
  /**
   * Border radius in pixels
   * @default 5
   */
  borderRadius?: number;
  /**
   * Stroke color for the trace
   * @default 'rgba(128, 113, 113, 0.5)'
   */
  strokeColor?: string;
  /**
   * Stroke width in pixels
   * @default 1
   */
  strokeWidth?: number;
  /**
   * Animation duration in seconds
   * @default 3
   */
  duration?: number;
  /**
   * Length of the visible trace segment (0-200, where 200 is full perimeter)
   * @default 20
   */
  traceLength?: number;
}

/**
 * Wraps content with an SVG-based border trace animation.
 * The trace follows the rectangular border perfectly, including corners.
 */
const BorderTraceWrapper: FunctionComponent<BorderTraceWrapperProps> = ({
  isActive,
  children,
  borderRadius = 5,
  strokeColor = 'rgba(128, 113, 113, 0.5)',
  strokeWidth = 1,
  duration = 3,
  traceLength = 20,
}) => {
  if (!isActive) return <>{children}</>;

  const gapLength = 200 - traceLength;

  return (
    <>
      <style>{`
        @keyframes strokeTrace {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
      <div className='relative inline-flex'>
        {/* SVG border trace */}
        <svg
          className='pointer-events-none absolute inset-0 h-full w-full overflow-visible'
          preserveAspectRatio='none'
          style={{ zIndex: 1 }}
        >
          <rect
            x='0.5'
            y='0.5'
            width='99%'
            height='99%'
            rx={borderRadius}
            ry={borderRadius}
            fill='none'
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            pathLength='200'
            strokeDasharray={`${traceLength} ${gapLength}`}
            style={{
              animation: `strokeTrace ${duration}s linear infinite`,
            }}
          />
        </svg>
        {/* Content */}
        <div className='relative'>{children}</div>
      </div>
    </>
  );
};

export default BorderTraceWrapper;
