import React, { useEffect, useState, useRef } from 'react';

interface RadarSweepProps {
  centerX: number;
  centerY: number;
  maxRadiusX: number;
  maxRadiusY: number;
}

/**
 * Radar sweep with smooth gradient wedge tail
 * Ported from lovable with Aucctus styling patterns
 */
const RadarSweep: React.FC<RadarSweepProps> = ({
  centerX,
  centerY,
  maxRadiusX,
  maxRadiusY,
}) => {
  const angleRef = useRef(180);
  const [, forceUpdate] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const sweepDuration = 1200; // 1.2 seconds for elegant swoop
  const pauseDuration = 8000; // 8 seconds pause between swoops

  useEffect(() => {
    let startTime: number | null = null;
    let animationId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runSweep = () => {
      setIsActive(true);
      startTime = null;
      angleRef.current = 180;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        if (elapsed >= sweepDuration) {
          setIsActive(false);
          angleRef.current = 180;
          timeoutId = setTimeout(runSweep, pauseDuration);
          return;
        }

        const progress = elapsed / sweepDuration;
        // Smooth cubic ease-in-out for elegant swoop feel
        const easedProgress =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        angleRef.current = 180 - easedProgress * 180;
        forceUpdate((n) => n + 1);
        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
    };

    runSweep();

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timeoutId);
    };
  }, []);

  const getEndpoint = (angle: number) => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: centerX + maxRadiusX * Math.cos(angleRad),
      y: centerY - maxRadiusY * Math.sin(angleRad),
    };
  };

  // Don't render when paused
  if (!isActive) return null;

  const angleDeg = angleRef.current;
  const tailAngleDeg = 35; // Slightly tighter wedge for elegance
  const mainEnd = getEndpoint(angleDeg);
  const tailEnd = getEndpoint(Math.min(angleDeg + tailAngleDeg, 180));

  // Create wedge path from center, to main line end, arc to tail end, back to center
  const createWedgePath = () => {
    // Large arc flag: 0 since we're always less than 180 degrees
    const largeArc = 0;
    // Sweep flag: 0 for counter-clockwise (from lower angle to higher angle going left)
    const sweep = 0;

    return `
      M ${centerX} ${centerY}
      L ${mainEnd.x} ${mainEnd.y}
      A ${maxRadiusX} ${maxRadiusY} 0 ${largeArc} ${sweep} ${tailEnd.x} ${tailEnd.y}
      Z
    `;
  };

  // Unique gradient ID based on current angle to update gradient direction
  const gradientId = 'sweepGradient';

  return (
    <g style={{ opacity: isActive ? 1 : 0, transition: 'opacity 0.3s' }}>
      <defs>
        {/* Gradient from line edge (slightly visible) to tail edge (transparent) */}
        <linearGradient
          id={gradientId}
          gradientUnits='userSpaceOnUse'
          x1={mainEnd.x}
          y1={mainEnd.y}
          x2={tailEnd.x}
          y2={tailEnd.y}
        >
          <stop offset='0%' stopColor='white' stopOpacity='0.08' />
          <stop offset='40%' stopColor='white' stopOpacity='0.03' />
          <stop offset='100%' stopColor='white' stopOpacity='0' />
        </linearGradient>

        {/* Soft blur for the gradient wedge */}
        <filter id='wedgeBlur' x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur in='SourceGraphic' stdDeviation='3' />
        </filter>
      </defs>

      {/* Gradient wedge fill */}
      <path
        d={createWedgePath()}
        fill={`url(#${gradientId})`}
        filter='url(#wedgeBlur)'
      />

      {/* Very subtle main sweep line */}
      <line
        x1={centerX}
        y1={centerY}
        x2={mainEnd.x}
        y2={mainEnd.y}
        stroke='white'
        strokeOpacity={0.15}
        strokeWidth='1'
        strokeLinecap='round'
      />
    </g>
  );
};

export default React.memo(RadarSweep);
