import api from '@libs/api';
import { useQuery } from 'react-query';
import { AucctusQueryKeys } from './query-keys';

/**
 * Custom hook for fetching property definitions for an account
 * @param accountUuid - The account UUID
 * @param includeInactive - Whether to include inactive properties (default: false)
 * @returns The result of the useQuery hook
 */
export const usePropertyDefinitions = (
  accountUuid?: string,
  includeInactive = false,
) => {
  return useQuery({
    queryKey: [
      AucctusQueryKeys.propertyDefinitions,
      accountUuid,
      includeInactive,
    ],
    queryFn: () =>
      api.property.getPropertyDefinitions(accountUuid!, includeInactive),
    enabled: !!accountUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

/**
 * Custom hook for fetching a single property definition
 * @param propertyUuid - The property definition UUID
 * @returns The result of the useQuery hook
 */
export const usePropertyDefinition = (propertyUuid?: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.propertyDefinition, propertyUuid],
    queryFn: () => api.property.getPropertyDefinition(propertyUuid!),
    enabled: !!propertyUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Custom hook for fetching custom properties for a concept
 * @param identifier - The concept identifier
 * @returns The result of the useQuery hook
 */
export const useConceptProperties = (identifier?: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.conceptProperties, identifier],
    queryFn: () => api.property.getConceptProperties(identifier!),
    enabled: !!identifier,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
