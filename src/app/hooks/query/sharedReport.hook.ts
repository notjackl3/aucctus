/**
 * Shared Report React Query Hooks
 *
 * Provides data fetching hooks for the public shared report viewer.
 * These hooks do NOT require authentication.
 */

import api from '@libs/api';
import type {
  ISendCodeRequest,
  IVerifyCodeRequest,
} from '@libs/api/types/sharedReport';
import { useMutation, useQuery } from 'react-query';

// ============================================
// Query Keys
// ============================================

export const sharedReportKeys = {
  all: ['sharedReport'] as const,
  info: (token: string) => [...sharedReportKeys.all, 'info', token] as const,
  report: (token: string) =>
    [...sharedReportKeys.all, 'report', token] as const,
};

// ============================================
// Public Hooks (No Auth)
// ============================================

/**
 * Fetches share metadata (concept title, account name, required email domain).
 */
export function useShareInfo(token: string) {
  return useQuery(
    sharedReportKeys.info(token),
    () => api.sharedReport.getShareInfo(token),
    {
      enabled: !!token,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );
}

/**
 * Sends a verification code to the recipient's email.
 */
export function useSendVerificationCode(token: string) {
  return useMutation((data: ISendCodeRequest) =>
    api.sharedReport.sendVerificationCode(token, data),
  );
}

/**
 * Verifies the email code and sets a session cookie.
 */
export function useVerifyCode(token: string) {
  return useMutation((data: IVerifyCodeRequest) =>
    api.sharedReport.verifyCode(token, data),
  );
}

/**
 * Fetches the full read-only report data. Only enabled after verification.
 */
export function useSharedReport(token: string, enabled: boolean) {
  return useQuery(
    sharedReportKeys.report(token),
    () => api.sharedReport.getReport(token),
    {
      enabled: enabled && !!token,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  );
}
