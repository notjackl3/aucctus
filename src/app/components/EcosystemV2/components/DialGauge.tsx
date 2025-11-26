import React, { useMemo } from 'react';

interface DialGaugeProps {
  score: number;
  directCompetitors?: number; // Optional, kept for potential future use
  emergingLabel?: string;
  moderateLabel?: string;
  crowdedLabel?: string;
}

const DialGauge: React.FC<DialGaugeProps> = ({
  score,
  emergingLabel = 'EMERGING',
  moderateLabel = 'MODERATE',
  crowdedLabel = 'CROWDED',
}) => {
  const { needleRotation, indicatorCx, indicatorCy } = useMemo(() => {
    // 1. Normalize score (0-100) to 0-1 range
    const normalizedValue = score / 100;
    // Clamp between 0 and 1
    const clampedValue = Math.max(0, Math.min(1, normalizedValue));

    // 2. Constants
    const CX = 120;
    const CY = 165 - Math.sqrt(2800); // Center Y: ~112.085
    const R = 80; // Arc radius - matches the path definition

    // 3. Angle Calculations
    // Arc path is: M 60 165 A 80 80 0 1 1 180 165
    // This means: Move to (60, 165), then draw an arc with radius 80
    // from (60, 165) to (180, 165) going clockwise (sweep-flag = 1)

    // Calculate angles from center (CX, CY) to arc endpoints
    // Start point: (60, 165)
    const THETA_START = Math.atan2(165 - CY, 60 - CX);

    // End point: (180, 165)
    const THETA_END = Math.atan2(165 - CY, 180 - CX);

    // Since we're sweeping counter-clockwise and THETA_START > THETA_END,
    // we need to add 2π to THETA_END to get the proper sweep
    const THETA_END_ADJUSTED = THETA_END + 2 * Math.PI;

    // Total angular sweep
    const THETA_SWEEP = THETA_END_ADJUSTED - THETA_START;

    // 4. Interpolate Angle and Calculate Position
    const currentTheta = THETA_START + THETA_SWEEP * clampedValue;

    // Position the indicator on the arc (radius R from center)
    const indicatorCx = CX + R * Math.cos(currentTheta);
    const indicatorCy = CY + R * Math.sin(currentTheta);

    // 5. Calculate Needle Rotation
    // Convert angle to degrees and adjust so needle points correctly
    // At THETA_START, needle should point toward start of arc
    const needleRotation = (currentTheta * 180) / Math.PI - 90;

    return { needleRotation, indicatorCx, indicatorCy };
  }, [score]);

  return (
    <div className='flex flex-col items-center py-2'>
      <div className='relative h-56 w-80'>
        {/* SVG Dial */}
        <svg viewBox='0 0 240 190' className='h-full w-full'>
          <defs>
            <linearGradient
              id='gaugeGradient'
              x1='0%'
              y1='0%'
              x2='100%'
              y2='0%'
            >
              <stop
                offset='0%'
                style={{ stopColor: '#22c55e', stopOpacity: 1 }}
              />
              <stop
                offset='50%'
                style={{ stopColor: '#eab308', stopOpacity: 1 }}
              />
              <stop
                offset='100%'
                style={{ stopColor: '#ef4444', stopOpacity: 1 }}
              />
            </linearGradient>

            {/* Path for text to follow - outer arc with larger radius */}
            <path
              id='textArc'
              d='M 33 165 A 102 102 0 1 1 207 165'
              fill='none'
            />
          </defs>

          {/* Arc path - 270 degree arc */}
          <path
            d='M 60 165 A 80 80 0 1 1 180 165'
            fill='none'
            stroke='url(#gaugeGradient)'
            strokeWidth='28'
            strokeLinecap='round'
          />

          {/* Needle - pointing to calculated position */}
          <g transform={`translate(120, ${165 - Math.sqrt(2800)})`}>
            <line
              x1='0'
              y1='0'
              x2='0'
              y2='-80'
              stroke='white'
              strokeWidth='5'
              strokeLinecap='round'
              transform={`rotate(${needleRotation})`}
              style={{ transformOrigin: 'center' }}
            />
            {/* Needle dot */}
            <circle cx='0' cy='0' r='10' fill='white' />
          </g>

          {/* Arc indicator at calculated position */}
          <circle
            cx={indicatorCx}
            cy={indicatorCy}
            r='14'
            fill='black'
            stroke='white'
            strokeWidth='3'
          />

          {/* Center metric number - showing score */}
          <text
            x='120'
            y='125'
            className='aucctus-text-primary'
            style={{ fontSize: '48px', fontWeight: 'bold' }}
            textAnchor='middle'
          >
            {score}
          </text>

          {/* Text labels following the arc - outside */}
          <text
            className='aucctus-text-secondary'
            style={{
              fontSize: '10px',
              fontWeight: '500',
              textTransform: 'uppercase',
            }}
          >
            <textPath href='#textArc' startOffset='3%'>
              {emergingLabel}
            </textPath>
          </text>
          <text
            className='aucctus-text-secondary'
            style={{
              fontSize: '10px',
              fontWeight: '500',
              textTransform: 'uppercase',
            }}
          >
            <textPath href='#textArc' startOffset='50%' textAnchor='middle'>
              {moderateLabel}
            </textPath>
          </text>
          <text
            className='aucctus-text-secondary'
            style={{
              fontSize: '10px',
              fontWeight: '500',
              textTransform: 'uppercase',
            }}
          >
            <textPath href='#textArc' startOffset='97%' textAnchor='end'>
              {crowdedLabel}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
};

export default React.memo(DialGauge);
