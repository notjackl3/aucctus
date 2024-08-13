export function formatLargeNumber(num: number) {
  /**
   * Formats a number with appropriate unit suffix (K, M, B, T) based on its magnitude.
   * Only shows the decimal if the number is not whole.
   *
   * @param num The number to be formatted.
   * @returns The formatted number with unit suffix.
   *
   * Example:
   *   formatNumber(1234567) // '1.2M'
   *   formatNumber(9876543210) // '9.8B'
   *   formatNumber(1000) // '1K'
   */
  const units: string[] = ['', 'K', 'M', 'B', 'T'];
  for (const unit of units) {
    if (Math.abs(num) < 1000.0) {
      if (num % 1 === 0) {
        // Number is whole
        return `${num}${unit}`;
      } else {
        // Number is not whole, format to 1 decimal place
        return `${parseFloat(num.toFixed(1))}${unit}`;
      }
    }
    num /= 1000.0;
  }
  // For numbers larger than a trillion, check again if it's whole or not.
  if (num % 1 === 0) {
    return `${num}T`;
  } else {
    return `${parseFloat(num.toFixed(1))}T`;
  }
}

export const formatNumber = (num: number) => {
  // Ensure num is a number and format it, otherwise return empty string
  return num.toLocaleString('en-US', {
    maximumFractionDigits: 0, // Ensure no fractional digits in the formatted output
  });
};

export const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
});

export const calculatePercent = (numerator: number, denominator: number) => {
  if (!numerator || !denominator) {
    return 0;
  }
  const percent = (numerator / denominator) * 100;
  const roundedPercent = Math.round(percent);
  return roundedPercent;
};

/**
 * Clamps a value between a specified minimum and maximum range.
 *
 * @param value - The value to be clamped.
 * @param min - The minimum limit.
 * @param max - The maximum limit.
 * @returns The clamped value.
 */
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
