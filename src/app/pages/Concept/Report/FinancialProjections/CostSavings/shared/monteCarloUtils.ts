// Generate sample Monte Carlo data
export const generateMonteCarloData = (
  timeHorizon: number,
  initialInvestment: number,
  meanReturn: number,
  stdDev: number,
) => {
  // Generate median line (50th percentile)
  const medianLine = Array.from({ length: timeHorizon + 1 }, (_, i) => {
    // Simple compounding with some randomization
    const base = initialInvestment * Math.pow(1 + meanReturn / 100, i);
    return Math.round(base);
  });

  // Generate upper band (90th percentile)
  const upperLine = medianLine.map((val) =>
    Math.round(val * (1 + (stdDev / 100) * 1.28)),
  );

  // Generate lower band (10th percentile)
  const lowerLine = medianLine.map((val) =>
    Math.round(val * (1 - (stdDev / 100) * 1.28)),
  );

  // Generate best case scenario (99th percentile)
  const bestCase = medianLine.map((val) =>
    Math.round(val * (1 + (stdDev / 100) * 2.33)),
  );

  // Generate worst case scenario (1st percentile)
  const worstCase = medianLine.map((val) =>
    Math.round(val * (1 - (stdDev / 100) * 1.28)),
  );

  // Note: In a real implementation, the number of simulations would affect
  // the statistical distribution of outcomes. This simplified version
  // only simulates the effect by updating the chart display.

  return Array.from({ length: timeHorizon + 1 }, (_, i) => ({
    month: i,
    median: medianLine[i],
    upper: upperLine[i],
    lower: lowerLine[i],
    best: bestCase[i],
    worst: worstCase[i],
  }));
};

// Format currency for chart tooltip
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
