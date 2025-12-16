/**
 * Utility functions for source-related operations
 */

/**
 * Generates a Logo.dev URL for a given domain
 * @param domain - The domain to get the logo for (e.g., 'stripe.com')
 * @returns The Logo.dev URL with authentication token
 */
export const getLogoUrl = (domain: string): string => {
  const token = import.meta.env.VITE_LOGO_DEV_TOKEN;
  return `https://img.logo.dev/${domain}?token=${token}`;
};

/**
 * Extracts the base URL from a full URL
 */
export const getBaseUrl = (url: string): string => {
  try {
    const urlObject = new URL(url);
    return urlObject.hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
};

/**
 * Debounce function utility
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Formats a date relative to now
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.ceil(diffDays / 30);

  if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} months ago`;
  } else {
    return date.toLocaleDateString();
  }
};
