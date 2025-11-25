import { IPropertyDefinition, IPropertyOption } from '@libs/api/types';

/**
 * Default color palette for property options
 * Softer colors from Tailwind config with proper contrast
 * Each entry includes background, text, and border colors
 */
export const DEFAULT_PROPERTY_COLORS = [
  '#F5F3F3', // Gray (default)
  '#FEF3F2', // Red
  '#FEF6EE', // Orange
  '#FFFAEB', // Amber
  '#ECFDF3', // Green
  '#F0F9FF', // Teal
  '#EFF8FF', // Blue
  '#EEF4FF', // Indigo
  '#F4F3FF', // Purple
  '#FDF2FA', // Pink
];

/**
 * Color palette with background, text, and border colors for proper contrast
 */
export const PROPERTY_COLOR_PALETTE_FULL = {
  '#F5F3F3': {
    bg: '#F5F3F3',
    text: '#514141',
    border: '#DAD5D5',
    name: 'Gray',
  },
  '#FEF3F2': { bg: '#FEF3F2', text: '#C1051C', border: '#FECDCA', name: 'Red' },
  '#FEF6EE': {
    bg: '#FEF6EE',
    text: '#B93815',
    border: '#F9DBAF',
    name: 'Orange',
  },
  '#FFFAEB': {
    bg: '#FFFAEB',
    text: '#B54708',
    border: '#FEDF89',
    name: 'Amber',
  },
  '#ECFDF3': {
    bg: '#ECFDF3',
    text: '#067647',
    border: '#ABEFC6',
    name: 'Green',
  },
  '#F0F9FF': {
    bg: '#F0F9FF',
    text: '#026AA2',
    border: '#B9E6FE',
    name: 'Teal',
  },
  '#EFF8FF': {
    bg: '#EFF8FF',
    text: '#175CD3',
    border: '#B2DDFF',
    name: 'Blue',
  },
  '#EEF4FF': {
    bg: '#EEF4FF',
    text: '#3538CD',
    border: '#C7D7FE',
    name: 'Indigo',
  },
  '#F4F3FF': {
    bg: '#F4F3FF',
    text: '#5925DC',
    border: '#D9D6FE',
    name: 'Purple',
  },
  '#FDF2FA': {
    bg: '#FDF2FA',
    text: '#C11574',
    border: '#FCCEEE',
    name: 'Pink',
  },
};

/**
 * Color palette with semantic names for UI selection
 */
export const PROPERTY_COLOR_PALETTE = {
  red: { hex: '#EF4444', name: 'Red' },
  amber: { hex: '#F59E0B', name: 'Amber' },
  emerald: { hex: '#10B981', name: 'Emerald' },
  blue: { hex: '#3B82F6', name: 'Blue' },
  violet: { hex: '#8B5CF6', name: 'Violet' },
  pink: { hex: '#EC4899', name: 'Pink' },
  teal: { hex: '#14B8A6', name: 'Teal' },
  orange: { hex: '#F97316', name: 'Orange' },
  indigo: { hex: '#6366F1', name: 'Indigo' },
  cyan: { hex: '#06B6D4', name: 'Cyan' },
  gray: { hex: '#6B7280', name: 'Gray' },
} as const;

/**
 * Normalize options to consistent object format with colors
 * Handles both legacy string format and new object format
 *
 * @param options - Array of options (strings or objects)
 * @returns Array of normalized option objects with value and color
 */
export const normalizePropertyOptions = (
  options: Array<string | IPropertyOption> | undefined,
): IPropertyOption[] => {
  if (!options || !Array.isArray(options)) {
    return [];
  }

  return options.map((option, index) => {
    if (typeof option === 'string') {
      // Legacy string format - assign default color
      return {
        value: option,
        color: DEFAULT_PROPERTY_COLORS[index % DEFAULT_PROPERTY_COLORS.length],
      };
    } else if (typeof option === 'object' && option !== null) {
      // New object format
      return {
        value: option.value || '',
        color:
          option.color ||
          DEFAULT_PROPERTY_COLORS[index % DEFAULT_PROPERTY_COLORS.length],
      };
    } else {
      // Fallback for invalid format
      return {
        value: String(option),
        color: DEFAULT_PROPERTY_COLORS[index % DEFAULT_PROPERTY_COLORS.length],
      };
    }
  });
};

/**
 * Extract just the values from options list (handles both formats)
 *
 * @param options - Array of options (strings or objects)
 * @returns Array of option values as strings
 */
export const extractOptionValues = (
  options: Array<string | IPropertyOption> | undefined,
): string[] => {
  if (!options || !Array.isArray(options)) {
    return [];
  }

  return options.map((option) => {
    if (typeof option === 'string') {
      return option;
    } else if (typeof option === 'object' && option !== null) {
      return option.value || '';
    }
    return String(option);
  });
};

/**
 * Get the color for a specific option value
 *
 * @param optionValue - The option value to find color for
 * @param definition - Property definition containing options
 * @returns Hex color code
 */
export const getOptionColor = (
  optionValue: string,
  definition: IPropertyDefinition,
): string => {
  const normalizedOptions = normalizePropertyOptions(definition.config.options);
  const option = normalizedOptions.find((opt) => opt.value === optionValue);
  return option?.color || DEFAULT_PROPERTY_COLORS[0];
};

/**
 * Get all normalized options with colors from a property definition
 *
 * @param definition - Property definition
 * @returns Array of normalized options with colors
 */
export const getPropertyOptions = (
  definition: IPropertyDefinition,
): IPropertyOption[] => {
  return normalizePropertyOptions(definition.config.options);
};

/**
 * Convert hex color to RGB values
 *
 * @param hex - Hex color code (e.g., "#FF0000")
 * @returns RGB object { r, g, b } or null if invalid
 */
export const hexToRgb = (
  hex: string,
): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculate luminance of a color (for determining text color contrast)
 *
 * @param hex - Hex color code
 * @returns Luminance value (0-1)
 */
export const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;

  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Determine if text should be white or black based on background color
 *
 * @param backgroundColor - Hex color code
 * @returns 'white' or 'black'
 */
export const getContrastTextColor = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  // WCAG contrast ratio threshold
  return luminance > 0.5 ? 'black' : 'white';
};

/**
 * Get full color scheme (background, text, border) for a color
 *
 * @param bgColor - Background hex color code
 * @returns Object with background, text, and border colors
 */
export const getColorScheme = (
  bgColor: string,
): { backgroundColor: string; color: string; borderColor: string } => {
  // Check if we have a predefined color scheme
  const upperColor = bgColor.toUpperCase();
  const scheme =
    PROPERTY_COLOR_PALETTE_FULL[
      upperColor as keyof typeof PROPERTY_COLOR_PALETTE_FULL
    ];

  if (scheme) {
    return {
      backgroundColor: scheme.bg,
      color: scheme.text,
      borderColor: scheme.border,
    };
  }

  // Fallback to contrast calculation for custom colors
  const textColor = getContrastTextColor(bgColor);
  return {
    backgroundColor: bgColor,
    color: textColor === 'white' ? '#FFFFFF' : '#000000',
    borderColor: bgColor,
  };
};

/**
 * Get Tailwind classes for a colored tag/badge
 * Now uses full color scheme with proper text and border colors
 *
 * @param color - Hex color code
 * @returns Object with style properties for inline styles
 */
export const getColoredTagStyles = (
  color: string,
): { backgroundColor: string; color: string; borderColor: string } => {
  return getColorScheme(color);
};
