import React, { useMemo } from 'react';

interface DialGaugeProps {
  lowValue?: number;
  highValue?: number;
  directCompetitors: number;
  emergingLabel?: string;
  moderateLabel?: string;
  crowdedLabel?: string;
}

const DialGauge: React.FC<DialGaugeProps> = ({
  lowValue = 0,
  highValue = 100,
  directCompetitors,
  emergingLabel = 'EMERGING',
  moderateLabel = 'MODERATE',
  crowdedLabel = 'CROWDED',
}) => {
  const { needleRotation, indicatorCx, indicatorCy } = useMemo(() => {
    // 1. Min-Max Normalization (Correct)
    const normalizedValue =
      (directCompetitors - lowValue) / (highValue - lowValue);
    // Clamp between 0 and 1 (Correct)
    const clampedValue = Math.max(0, Math.min(1, normalizedValue));

    // 2. Constants (Correct)
    const CX = 120;
    const CY = 165 - Math.sqrt(2800); // Center Y: ~112.085
    const R = 80;

    // 3. Angle Calculations (FIXED)
    // The second argument to atan2 is the X-difference, the first is the Y-difference.

    // Y-difference for both start/end is 165 - CY (~52.915)
    const DELTA_Y = 165 - CY;

    // Start angle (60, 165)
    // X-difference: 60 - CX = 60 - 120 = -60
    const THETA_START = Math.atan2(DELTA_Y, 60 - CX);

    // End angle (180, 165)
    // X-difference: 180 - CX = 180 - 120 = 60
    const THETA_END = Math.atan2(DELTA_Y, 180 - CX);

    // Adjust THETA_END for the required counter-clockwise MAJOR arc sweep (Correct)
    // Since THETA_START (~2.433 rad) > THETA_END (~0.709 rad), we must add 2*PI to sweep CCW.
    const THETA_END_ADJUSTED = THETA_END + 2 * Math.PI;

    // Total angular distance (Correct)
    const THETA_SWEEP = THETA_END_ADJUSTED - THETA_START;

    // 4. Interpolate Angle and Calculate Position (Correct)
    const currentTheta = THETA_START + THETA_SWEEP * clampedValue;

    const indicatorCx = CX + R * Math.cos(currentTheta);
    const indicatorCy = CY + R * Math.sin(currentTheta);

    // 5. Calculate Rotation (Correct)
    // Convert currentTheta to degrees, and subtract 90° because 0 radians (3 o'clock)
    // corresponds to a needle pointing straight right, but we want it to point UP (12 o'clock) at 0° rotation.
    const needleRotation = (currentTheta * 180) / Math.PI - 90;

    return { needleRotation, indicatorCx, indicatorCy };
  }, [directCompetitors, lowValue, highValue]);

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
          <g transform='translate(120, 165)'>
            <line
              x1='0'
              y1='0'
              x2='0'
              y2='-67'
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
            r='15.18'
            fill='black'
            stroke='white'
            strokeWidth='5.85'
          />

          {/* Center metric number */}
          <text
            x='120'
            y='125'
            className='aucctus-text-primary'
            style={{ fontSize: '48px', fontWeight: 'bold' }}
            textAnchor='middle'
          >
            {directCompetitors}
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
