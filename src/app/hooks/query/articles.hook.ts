import api from '@libs/api';
import { useQuery } from 'react-query';
import { AucctusQueryKeys } from './query-keys';
import { ISource } from '@libs/api/types';
import { getLogoUrl } from '@libs/utils/source';

const getBaseUrl = (url: string): string => {
  try {
    const urlObject = new URL(url);
    return urlObject.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/**
 * Company info result from Logo.dev
 */
interface CompanyInfo {
  name: string;
  domain: string;
  logo: string;
}

/**
 * Hook to fetch company information (name, logo, etc.) from domain.
 * Uses Logo.dev image endpoint directly with the publishable key (client-safe).
 * @see https://docs.logo.dev
 */
export const useCompanyInfo = (url: string) => {
  const baseUrl = getBaseUrl(url);
  const hasValidUrl = Boolean(
    url && url.trim() !== '' && baseUrl && baseUrl !== '',
  );

  const query = useQuery({
    queryKey: [AucctusQueryKeys.companyInfo, baseUrl],
    staleTime: Infinity,
    cacheTime: Infinity,
    enabled: hasValidUrl,
    queryFn: async (): Promise<CompanyInfo[]> => {
      // Use Logo.dev image endpoint directly with domain
      // The publishable key is safe to use client-side
      return [
        {
          name: baseUrl,
          domain: baseUrl,
          logo: getLogoUrl(baseUrl),
        },
      ];
    },
  });

  return { ...query, company: query.data || [] };
};

// TODO: Combine this with the published dates on server side
export const usePublishedDatesQuery = (
  source: ISource,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.articlePublishedDate, source.url],
    staleTime: Infinity,
    cacheTime: Infinity,
    enabled: enabled,
    queryFn: async () => {
      try {
        const date = await api.article.getArticlePublishedDate(source.url);
        return date;
      } catch (error) {
        return undefined;
      }
    },
  });
};
