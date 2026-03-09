import api from '@libs/api';
import {
  ICreatePropertyDefinitionPayload,
  IUpdatePropertyDefinitionPayload,
} from '@libs/api/types';
import { toast } from '@components';
import { useMutation, useQueryClient } from 'react-query';
import { AucctusQueryKeys } from './query-keys';
import { useColumnVisibilityStore } from '@stores/table-columns.store';

/**
 * Hook for creating a new property definition
 */
export const useCreatePropertyDefinition = () => {
  const queryClient = useQueryClient();
  const { toggleColumnVisibility, visiblePropertyColumns } =
    useColumnVisibilityStore();

  return useMutation(
    async (payload: ICreatePropertyDefinitionPayload) => {
      const { accountUuid, ...data } = payload;
      return api.property.createPropertyDefinition(accountUuid, data);
    },
    {
      onSuccess: (data, variables) => {
        toast.success(
          'Property Created',
          `"${variables.name}" has been created successfully`,
        );

        // Make the new property column visible by default
        if (data?.key && !visiblePropertyColumns.has(data.key)) {
          toggleColumnVisibility(data.key);
        }

        // Invalidate property definitions query to refetch
        queryClient.invalidateQueries([
          AucctusQueryKeys.propertyDefinitions,
          variables.accountUuid,
        ]);

        // Invalidate concepts query to get updated data with new property
        queryClient.invalidateQueries([AucctusQueryKeys.concepts]);
      },
      onError: (error: any) => {
        toast.error(
          'Creation Failed',
          error?.response?.data?.detail || 'Failed to create property',
        );
      },
    },
  );
};

/**
 * Hook for updating an existing property definition
 */
export const useUpdatePropertyDefinition = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (payload: IUpdatePropertyDefinitionPayload) => {
      const { propertyUuid, ...data } = payload;
      return api.property.updatePropertyDefinition(propertyUuid, data);
    },
    {
      onSuccess: () => {
        toast.success(
          'Property Updated',
          'Property has been updated successfully',
        );

        // Invalidate all property definition queries
        queryClient.invalidateQueries([AucctusQueryKeys.propertyDefinitions]);

        // Invalidate concepts to refetch with updated property data
        queryClient.invalidateQueries([AucctusQueryKeys.concepts]);
      },
      onError: (error: any) => {
        toast.error(
          'Update Failed',
          error?.response?.data?.detail || 'Failed to update property',
        );
      },
    },
  );
};

/**
 * Hook for deleting (soft delete) a property definition
 */
export const useDeletePropertyDefinition = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (propertyUuid: string) => {
      return api.property.deletePropertyDefinition(propertyUuid);
    },
    {
      onSuccess: () => {
        toast.success('Property Deleted', 'Property has been deactivated');

        // Invalidate all property definition queries
        queryClient.invalidateQueries([AucctusQueryKeys.propertyDefinitions]);

        // Invalidate concepts to refetch
        queryClient.invalidateQueries([AucctusQueryKeys.concepts]);
      },
      onError: (error: any) => {
        toast.error(
          'Deletion Failed',
          error?.response?.data?.detail || 'Failed to delete property',
        );
      },
    },
  );
};

/**
 * Hook for updating a concept's custom property value
 */
export const useUpdateConceptProperty = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      identifier,
      key,
      value,
    }: {
      identifier: string;
      key: string;
      value: any;
    }) => {
      return api.property.setConceptProperty(identifier, key, value);
    },
    {
      onSuccess: () => {
        // Invalidate concepts query to refetch with updated property
        queryClient.invalidateQueries([AucctusQueryKeys.concepts]);

        // Optionally show a success toast (commented out for less noise during inline editing)
        // toast.success('Property Updated', 'Property has been updated');
      },
      onError: (error: any, variables) => {
        toast.error(
          'Update Failed',
          error?.response?.data?.detail || `Failed to update ${variables.key}`,
        );
      },
    },
  );
};

/**
 * Hook for reordering property columns by updating display_order
 * Note: UI updates are handled via local state in the table hook.
 * This mutation only persists changes to the backend.
 */
export const useReorderPropertyColumns = (accountUuid?: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (updates: Array<{ uuid: string; display_order: number }>) => {
      // Use bulk update endpoint for atomic transaction
      const response =
        await api.property.bulkUpdatePropertyDefinitions(updates);

      // Check if any updates failed
      if (response.failed > 0) {
        const errors = response.results
          .filter((r) => !r.success)
          .map((r) => r.error)
          .join(', ');
        throw new Error(`Some updates failed: ${errors}`);
      }

      return response;
    },
    {
      // On error, show toast and invalidate to sync with backend state
      onError: (error: any) => {
        toast.error(
          'Reorder Failed',
          error?.response?.data?.detail || 'Failed to reorder columns',
        );

        // Invalidate to sync local state with backend on error
        queryClient.invalidateQueries([
          AucctusQueryKeys.propertyDefinitions,
          accountUuid,
          false,
        ]);
      },
      // On success, invalidate to ensure cache is fresh
      onSuccess: () => {
        queryClient.invalidateQueries([
          AucctusQueryKeys.propertyDefinitions,
          accountUuid,
          false,
        ]);
      },
    },
  );
};
