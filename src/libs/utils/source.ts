/**
 * Utility functions for source-related operations
 */

import api from '@libs/api';

/**
 * Generates a Logo.dev URL for a given domain
 * @param domain - The domain to get the logo for (e.g., 'stripe.com')
 * @returns The Logo.dev URL with authentication token and transparent PNG format
 */
export const getLogoUrl = (domain: string): string => {
  const token = import.meta.env.VITE_LOGO_DEV_TOKEN;
  return `https://img.logo.dev/${domain}?token=${token}&format=png`;
};

/**
 * Searches for a company logo using Logo.dev search API via backend proxy.
 * The backend handles the secret key authentication to avoid CORS issues.
 * @param companyName - The company name to search for (e.g., 'Schreiber')
 * @returns Promise with the logo URL from the first search result, or null if not found
 */
export const searchCompanyLogo = async (
  companyName: string,
): Promise<string | null> => {
  try {
    const response = await api.article.searchCompanyLogo(companyName);

    // Get the first result's logoUrl (Django Ninja converts snake_case to camelCase)
    if (response?.results?.length > 0 && response.results[0].logoUrl) {
      return response.results[0].logoUrl;
    }

    return null;
  } catch {
    // Silently fail - logo is optional
    return null;
  }
};

/**
 * Extracts the base hostname from an http(s) URL.
 *
 * Returns `''` for internal `aucctus://` URIs (the URI's feature segment
 * "nucleus" / "watchtower" / "concept" is NOT a real hostname and must
 * not be displayed or fed to favicon lookup). Returns `''` for malformed
 * or absent URLs. Callers should treat the empty return as "no domain"
 * and render an alternate label / icon — most existing callers already
 * use the `domain || fallback` pattern.
 */
export const getBaseUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('aucctus://')) return '';
  try {
    const urlObject = new URL(url);
    return urlObject.hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
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
