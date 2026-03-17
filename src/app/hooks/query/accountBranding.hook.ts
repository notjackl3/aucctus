/**
 * Account Branding React Query Hooks
 *
 * Provides data fetching and mutation hooks for the Nucleus Personalization tab.
 * Manages brand colors, logo, and headquarters image.
 */

import { toast } from '@components';
import api from '@libs/api';
import type {
  IAccountBranding,
  IUpdateAccountBrandingPayload,
} from '@libs/api/types/accountBranding';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { AucctusQueryKeys } from './query-keys';

// ============================================
// Query Keys
// ============================================

export const accountBrandingKeys = {
  all: [AucctusQueryKeys.accountBranding] as const,
  detail: () => [...accountBrandingKeys.all, 'detail'] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch the account's branding information.
 * Returns brand colors, logo URL, HQ image URL, etc.
 */
export const useAccountBranding = () => {
  const query = useQuery({
    queryKey: accountBrandingKeys.detail(),
    queryFn: async (): Promise<IAccountBranding> => {
      return await api.accountBranding.getBranding();
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Branding Fetch Failed',
          message || 'Unable to fetch branding information. Please try again',
        );
      }
    },
  });

  return {
    ...query,
    branding: query.data ?? null,
    hasBranding: !!query.data,
  };
};

// ============================================
// Mutation Hooks
// ============================================

/**
 * Update the account's branding information (colors, name, tagline, etc.).
 */
export const useUpdateBranding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IUpdateAccountBrandingPayload) => {
      return await api.accountBranding.updateBranding(data);
    },
    onMutate: async (data: IUpdateAccountBrandingPayload) => {
      await queryClient.cancelQueries(accountBrandingKeys.detail());
      const previous = queryClient.getQueryData<IAccountBranding>(
        accountBrandingKeys.detail(),
      );
      if (previous) {
        queryClient.setQueryData<IAccountBranding>(
          accountBrandingKeys.detail(),
          { ...previous, ...data },
        );
      }
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(accountBrandingKeys.all);
    },
    onError: (e: AxiosError, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          accountBrandingKeys.detail(),
          context.previous,
        );
      }
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to update branding. Please try again',
      );
    },
  });
};

/**
 * Upload a headquarters or branch image.
 */
export const useUploadHqImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      return await api.accountBranding.uploadHqImage(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(accountBrandingKeys.all);
      toast.success('Image Uploaded', 'Headquarters image has been updated.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Upload Failed',
        message || 'Unable to upload image. Please try again',
      );
    },
  });
};

/**
 * Upload a logo for the account.
 */
export const useUploadLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      return await api.accountBranding.uploadLogo(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(accountBrandingKeys.all);
      queryClient.invalidateQueries([AucctusQueryKeys.accountLogo]);
      toast.success('Logo Uploaded', 'Your logo has been updated.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Upload Failed',
        message || 'Unable to upload logo. Please try again',
      );
    },
  });
};
