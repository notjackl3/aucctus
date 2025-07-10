import api from '@libs/api';
import { useQuery } from 'react-query';
import { AucctusQueryKeys } from './query-keys';
import { ISource } from '@libs/api/types';

const getBaseUrl = (url: string): string => {
  try {
    const urlObject = new URL(url);
    return urlObject.hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
};

// TODO: Combine this with the published dates on server side
export const useClearbitCompany = (url: string) => {
  const baseUrl = getBaseUrl(url);

  const query = useQuery({
    queryKey: [AucctusQueryKeys.clearbitCompany, baseUrl],
    staleTime: Infinity,
    cacheTime: Infinity,
    queryFn: async () => {
      const response = await fetch(
        `https://autocomplete.clearbit.com/v1/companies/suggest?query=${baseUrl}`,
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
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
