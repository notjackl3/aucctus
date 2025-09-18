/**
 * Utility functions for creating hexagon and radar chart SVG paths
 * Ported from lovable trends utilities
 */

import type { ITrendCategory } from '../config';

/**
 * Creates an SVG path for a hexagon
 */
export const createHexagonPath = (
  centerX: number,
  centerY: number,
  radius: number,
): string => {
  const points: string[] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * 2 * Math.PI - Math.PI / 2; // Start from top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }

  points.push('Z'); // Close the path
  return points.join(' ');
};

/**
 * Creates an SVG path for the radar data polygon
 */
export const createRadarPath = (
  categories: ITrendCategory[],
  centerX: number,
  centerY: number,
  outerRadius: number,
): string => {
  const points: string[] = [];

  categories.forEach((category, index) => {
    const angle = (index / categories.length) * 2 * Math.PI - Math.PI / 2;
    // Invert radar value so higher values are closer to center (higher impact)
    const invertedRadarValue = 10 - category.radarValue;
    const radius = (invertedRadarValue / 10) * outerRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    if (index === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  });

  points.push('Z'); // Close the path
  return points.join(' ');
};
