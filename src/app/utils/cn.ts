import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that combines clsx and tailwind-merge to provide
 * a convenient way to conditionally join Tailwind CSS classes together.
 *
 * @param inputs - The class values to be conditionally combined
 * @returns Merged and deduped Tailwind CSS class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
