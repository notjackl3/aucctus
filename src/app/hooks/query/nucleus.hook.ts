import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { AucctusQueryKeys } from './query-keys';

/**
 * Custom hook for fetching the latest nucleus report for the authenticated user's account.
 * Returns the complete nucleus report with all sections, questions, answers, and sources.
 */
export const useNucleusReportLatest = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.nucleusReportLatest],
    queryFn: async () => await api.nucleus.getLatestReport(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      // Only show error if it's not a 404 (no reports found)
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          message || 'Failed to fetch nucleus report. Please try again.',
        );
      }
    },
  });

  return {
    ...query,
    nucleusReport: query.data,
    hasNucleusReport: !!query.data,
    isNoReportFound:
      query.error && (query.error as AxiosError)?.response?.status === 404,
  };
};

/**
 * Custom hook for fetching a list of nucleus reports for the authenticated user's account.
 * Returns simplified report data for overview/summary views.
 */
export const useNucleusReportsList = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.nucleusReportsList],
    queryFn: async () => await api.nucleus.getReportsList(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Failed to fetch nucleus reports list. Please try again.',
      );
    },
  });

  return {
    ...query,
    nucleusReports: query.data || [],
    hasReports: (query.data || []).length > 0,
  };
};

/**
 * Custom hook for fetching a specific nucleus report by UUID.
 * Returns the complete nucleus report with all related data.
 */
export const useNucleusReport = (reportUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.nucleusReport, reportUuid],
    queryFn: async () =>
      reportUuid ? await api.nucleus.getReportByUuid(reportUuid) : null,
    enabled: !!reportUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Failed to fetch nucleus report. Please try again.',
      );
    },
  });

  return {
    ...query,
    nucleusReport: query.data,
    hasNucleusReport: !!query.data,
  };
};
