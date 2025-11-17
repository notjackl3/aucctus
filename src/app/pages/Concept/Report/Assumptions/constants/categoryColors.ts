import { AssumptionCategory } from '@libs/api/types';

// Define a structure for category colors for various UI elements
export interface CategoryColorSet {
  // Color used for category icon background
  iconBg: string;
  // Main color for progress bar in standard state
  progressBar: string;
  // Lighter version for incomplete sections
  progressBarLight: string;
  // Darker version for sections exceeding threshold
  progressBarDark: string;
  // Very light background for progress containers
  bgColor: string;
  // Border color for selection state
  borderColor: string;
  // Fill color for icons
  fill: string;
  // Stroke color for icons
  stroke: string;
  // Text color for elements related to this category
  text: string;
  // Text color for selected state (darker shade)
  textSelected: string;
}

// Define colors for each category
export const CATEGORY_COLORS: Record<AssumptionCategory, CategoryColorSet> = {
  desirability: {
    iconBg: 'bg-pink-100',
    progressBar: 'bg-pink-500',
    progressBarLight: 'bg-pink-300/30',
    progressBarDark: 'bg-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-l-pink-500',
    fill: 'fill-pink-500',
    stroke: 'stroke-pink-500',
    text: 'text-pink-500',
    textSelected: 'text-pink-700',
  },
  viability: {
    iconBg: 'bg-purple-100',
    progressBar: 'bg-purple-500',
    progressBarLight: 'bg-purple-300/30',
    progressBarDark: 'bg-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-l-purple-500',
    fill: 'fill-purple-500',
    stroke: 'stroke-purple-500',
    text: 'text-purple-500',
    textSelected: 'text-purple-700',
  },
  feasibility: {
    iconBg: 'bg-blue-100',
    progressBar: 'bg-blue-500',
    progressBarLight: 'bg-blue-300/30',
    progressBarDark: 'bg-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-l-blue-500',
    fill: 'fill-blue-500',
    stroke: 'stroke-blue-500',
    text: 'text-blue-500',
    textSelected: 'text-blue-700',
  },
  adaptability: {
    iconBg: 'bg-orange-100',
    progressBar: 'bg-orange-500',
    progressBarLight: 'bg-orange-300/30',
    progressBarDark: 'bg-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-l-orange-500',
    fill: 'fill-orange-500',
    stroke: 'stroke-orange-500',
    text: 'text-orange-500',
    textSelected: 'text-orange-700',
  },
};

// Helper function to get colors for a specific category
export const getCategoryColors = (
  category: AssumptionCategory,
): CategoryColorSet => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.desirability;
};

// For invalidated elements
export const INVALIDATED_COLORS = {
  progressBar: 'bg-gray-300',
  progressBarLight: 'bg-gray-200/30',
  progressBarDark: 'bg-gray-400',
  bgColor: 'bg-gray-100',
};

// UI common colors
export const COMMON_COLORS = {
  emptyProgressBar: 'bg-gray-100',
  thresholdMarker: 'bg-gray-600',
  textPrimary: 'aucctus-text-primary',
  textSecondary: 'aucctus-text-secondary',
  textTertiary: 'aucctus-text-tertiary',
};
