/**
 * React Query hooks for Custom Commands
 *
 * Provides hooks for fetching, creating, updating, and deleting
 * custom Overseer commands.
 */

import api from '@libs/api';
import {
  CustomCommand,
  CustomCommandCreateRequest,
  CustomCommandForPicker,
  CustomCommandListResponse,
  CustomCommandUpdateRequest,
} from '@libs/api/types';
import { toast } from '@components';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AucctusQueryKeys } from './query-keys';

/**
 * Hook for fetching all custom commands for the current account.
 *
 * @param includeInactive - Whether to include inactive commands (default: false)
 * @param enabled - Whether the query should run (default: true)
 */
export const useCustomCommands = (
  includeInactive: boolean = false,
  enabled: boolean = true,
) => {
  return useQuery<CustomCommandListResponse>(
    [AucctusQueryKeys.customCommands, includeInactive],
    () => api.customCommands.getCustomCommands(includeInactive),
    {
      enabled,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  );
};

/**
 * Hook for fetching custom commands in a lightweight format for the command picker.
 * Only returns active commands with minimal data.
 *
 * @param enabled - Whether the query should run (default: true)
 */
export const useCustomCommandsForPicker = (enabled: boolean = true) => {
  return useQuery<CustomCommandForPicker[]>(
    [AucctusQueryKeys.customCommandsForPicker],
    () => api.customCommands.getCustomCommandsForPicker(),
    {
      enabled,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  );
};

/**
 * Hook for fetching a specific custom command by UUID.
 *
 * @param commandUuid - The UUID of the command to fetch
 * @param enabled - Whether the query should run (default: true)
 */
export const useCustomCommand = (
  commandUuid: string | undefined,
  enabled: boolean = true,
) => {
  return useQuery<CustomCommand>(
    [AucctusQueryKeys.customCommand, commandUuid],
    () => api.customCommands.getCustomCommand(commandUuid!),
    {
      enabled: enabled && !!commandUuid,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
};

/**
 * Hook for creating a new custom command.
 */
export const useCreateCustomCommand = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (payload: CustomCommandCreateRequest) => {
      return api.customCommands.createCustomCommand(payload);
    },
    {
      onSuccess: (data) => {
        toast.success(
          'Command Created',
          `"/${data.name}" has been created successfully`,
        );

        // Invalidate custom commands queries
        queryClient.invalidateQueries([AucctusQueryKeys.customCommands]);
        queryClient.invalidateQueries([
          AucctusQueryKeys.customCommandsForPicker,
        ]);
      },
      onError: (error: any) => {
        toast.error(
          'Creation Failed',
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            'Failed to create custom command',
        );
      },
    },
  );
};

/**
 * Hook for updating an existing custom command.
 */
export const useUpdateCustomCommand = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      commandUuid,
      data,
    }: {
      commandUuid: string;
      data: CustomCommandUpdateRequest;
    }) => {
      return api.customCommands.updateCustomCommand(commandUuid, data);
    },
    {
      onSuccess: (data) => {
        toast.success(
          'Command Updated',
          `"/${data.name}" has been updated successfully`,
        );

        // Invalidate custom commands queries
        queryClient.invalidateQueries([AucctusQueryKeys.customCommands]);
        queryClient.invalidateQueries([
          AucctusQueryKeys.customCommandsForPicker,
        ]);
        queryClient.invalidateQueries([
          AucctusQueryKeys.customCommand,
          data.uuid,
        ]);
      },
      onError: (error: any) => {
        toast.error(
          'Update Failed',
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            'Failed to update custom command',
        );
      },
    },
  );
};

/**
 * Hook for deleting a custom command.
 */
export const useDeleteCustomCommand = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (commandUuid: string) => {
      return api.customCommands.deleteCustomCommand(commandUuid);
    },
    {
      onSuccess: () => {
        toast.success('Command Deleted', 'Custom command has been deleted');

        // Invalidate custom commands queries
        queryClient.invalidateQueries([AucctusQueryKeys.customCommands]);
        queryClient.invalidateQueries([
          AucctusQueryKeys.customCommandsForPicker,
        ]);
      },
      onError: (error: any) => {
        toast.error(
          'Deletion Failed',
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            'Failed to delete custom command',
        );
      },
    },
  );
};
