interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

export default function ScoreGauge({ score, size = 'md', label }: ScoreGaugeProps) {
  const dimensions = { sm: 64, md: 100, lg: 160 };
  const strokeWidths = { sm: 5, md: 6, lg: 8 };
  const fontSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };

  const dim = dimensions[size];
  const sw = strokeWidths[size];
  const radius = (dim - sw) / 2;
  const circumference = Math.PI * radius; // half circle
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={dim} height={dim / 2 + sw} viewBox={`0 0 ${dim} ${dim / 2 + sw}`}>
        {/* Background arc */}
        <path
          d={`M ${sw / 2} ${dim / 2} A ${radius} ${radius} 0 0 1 ${dim - sw / 2} ${dim / 2}`}
          fill="none"
          stroke="#e8e0dd"
          strokeWidth={sw}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${sw / 2} ${dim / 2} A ${radius} ${radius} 0 0 1 ${dim - sw / 2} ${dim / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
        {/* Score text */}
        <text
          x={dim / 2}
          y={dim / 2 - 2}
          textAnchor="middle"
          className={`${fontSizes[size]} font-semibold`}
          fill={color}
          style={{ fontSize: size === 'sm' ? 18 : size === 'md' ? 28 : 44 }}
        >
          {score}
        </text>
      </svg>
      {label && (
        <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
}
