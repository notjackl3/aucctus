import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md';
}

const getGaugeColor = (score: number): string => {
  if (score >= 80) return '#16a34a'; // Green
  if (score >= 70) return '#eab308'; // Yellow
  if (score >= 60) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

const GAUGE_CONFIG = {
  sm: {
    width: 90,
    height: 54,
    viewBox: '0 0 120 72',
    arc: 'M 12 60 A 48 48 0 0 1 108 60',
    strokeWidth: 10,
    textX: 60,
    textY: 56,
    fontSize: '26px',
    className: 'flex-shrink-0',
  },
  md: {
    width: 160,
    height: 96,
    viewBox: '0 0 160 96',
    arc: 'M 16 80 A 64 64 0 0 1 144 80',
    strokeWidth: 14,
    textX: 80,
    textY: 72,
    fontSize: '36px',
    className: 'mb-4',
  },
} as const;

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 'md' }) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const gaugeColor = getGaugeColor(clampedScore);
  const config = GAUGE_CONFIG[size];

  return (
    <svg
      width={config.width}
      height={config.height}
      viewBox={config.viewBox}
      className={config.className}
    >
      {/* Gray background arc (full) */}
      <path
        d={config.arc}
        fill='none'
        stroke='#e5e7eb'
        strokeWidth={config.strokeWidth}
        strokeLinecap='round'
      />

      {/* Colored progress arc (proportional to score) */}
      <path
        d={config.arc}
        fill='none'
        stroke={gaugeColor}
        strokeWidth={config.strokeWidth}
        strokeLinecap='round'
        pathLength={100}
        strokeDasharray={`${clampedScore} 100`}
      />

      {/* Score number in center */}
      <text
        x={config.textX}
        y={config.textY}
        textAnchor='middle'
        className='fill-current'
        style={{ fontSize: config.fontSize, fontWeight: 'bold' }}
      >
        {clampedScore}
      </text>
    </svg>
  );
};

export default ScoreGauge;
