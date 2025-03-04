import api from '@libs/api';
import { useQuery } from 'react-query';
import { AucctusQueryKeys } from './query-keys';
import { IIncumbent, IStartup } from '@libs/api/types';

/**
 * Custom hook for fetching an incumbent company by UUID.
 * @param uuid - The UUID of the incumbent to fetch.
 * @returns An object containing the query result and the incumbent data.
 */
export const useIncumbent = (uuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.incumbent, uuid],
    staleTime: 0,
    cacheTime: Infinity,
    queryFn: async () =>
      uuid ? await api.marketScan.getIncumbent(uuid) : void 0,
    enabled: !!uuid,
    refetchInterval: (data?: IIncumbent) => {
      return data && data.status === 'completed' ? false : 5000;
    },
  });

  return { ...query, incumbent: query.data };
};

/**
 * Custom hook for fetching a startup company by UUID.
 * @param uuid - The UUID of the startup to fetch.
 * @returns An object containing the query result and the startup data.
 */
export const useStartup = (uuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.startup, uuid],
    staleTime: 0,
    cacheTime: Infinity,
    refetchInterval: (data?: IStartup) => {
      return data && data.status === 'completed' ? false : 5000;
    },
    queryFn: async () =>
      uuid ? await api.marketScan.getStartup(uuid) : void 0,
    enabled: !!uuid,
  });

  return { ...query, startup: query.data };
};
