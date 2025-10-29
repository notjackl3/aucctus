/**
 * Utility functions for Insight components
 */

/**
 * Get the first letter of a source for display in avatar
 */
export const getSourceInitial = (source: string): string => {
  return source ? source.charAt(0).toUpperCase() : 'S';
};

/**
 * Get a consistent color for a source based on its name
 */
export const getSourceColor = (source: string): string => {
  if (!source) return 'bg-gray-400';

  // Simple hash function to get consistent colors for sources
  const hash = source.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // List of possible background colors for source avatars
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-rose-500',
  ];

  return colors[Math.abs(hash) % colors.length];
};
