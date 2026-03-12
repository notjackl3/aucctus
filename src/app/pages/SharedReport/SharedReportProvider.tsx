/**
 * Provides IConceptReportContext for shared report pages.
 *
 * Uses a dedicated QueryClient with refetch-prevention defaults and seeds
 * the cache synchronously (in useMemo) before children render. This prevents
 * standard components from firing authenticated API requests (which would 401).
 *
 * Also sets the Zustand conceptReport store slice so components that read
 * from the store (CustomerProfile, MarketScanV3, Ecosystem, etc.) work.
 */

import React, { useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import type { ISharedReport } from '@libs/api/types/sharedReport';
import type { IConcept } from '@libs/api/types';
import { ConceptReportContext } from '@pages/Concept/Report/ConceptReport/ConceptReportContext';
import { seedSharedReportCache } from './seedSharedReportCache';
import useStore from '@stores/store';

interface SharedReportProviderProps {
  report: ISharedReport;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

/**
 * Maps ISharedReport data to a partial IConcept shape.
 * Provides safe defaults for fields that don't exist on shared reports.
 */
function mapToConcept(report: ISharedReport): IConcept {
  const { concept } = report;

  return {
    // IBaseConceptEntity
    uuid: concept.uuid,
    version: 1,
    createdAt: '',
    updatedAt: '',

    // Core fields
    title: concept.title,
    summary: concept.summary || '',
    overview: '',
    valueProposition: '',
    problemStatement: '',
    differentiators: [],
    rightsToWin: [],
    identifier: concept.identifier,

    // Status
    reportStatusAggregate:
      (concept.reportStatusAggregate as IConcept['reportStatusAggregate']) ||
      'complete',
    reportStatusBySection: report.reportStatusBySection
      ? Object.fromEntries(
          Object.entries(report.reportStatusBySection).map(([key, val]) => [
            key,
            {
              status:
                (val.status as IConcept['reportStatusAggregate']) || 'complete',
              dateStarted: val.dateStarted || '',
              dateCompleted: val.dateCompleted || '',
            },
          ]),
        )
      : {},
    dateReportStarted: '',
    dateReportCompleted: '',
    status: concept.status as IConcept['status'],
    category: 'active' as const,

    // User — shared reports don't expose creator
    createdBy: {
      id: 0,
      userId: 0,
      firstName: report.sharedByName,
      lastName: '',
      email: '',
    } as IConcept['createdBy'],

    // Seed
    hasSeed: concept.hasSeed,
    seedUuid: concept.seedUuid || '',
    seedType: (concept.seedType || '') as IConcept['seedType'],
    hasSeenConceptChange: false,

    // Feature versions
    featureVersions: report.featureVersions,
    financialProjectionType: (concept.financialProjectionType ||
      'generate_revenue') as IConcept['financialProjectionType'],

    // Image
    conceptImageUrl: concept.conceptImageUrl || undefined,
  } as IConcept;
}

const SharedReportProvider: React.FC<SharedReportProviderProps> = ({
  report,
  onTabChange,
  children,
}) => {
  const setConceptUuid = useStore((s) => s.conceptReport.setConceptUuid);
  const setActiveConcept = useStore((s) => s.conceptReport.setActiveConcept);

  const concept = useMemo(() => mapToConcept(report), [report]);

  // Create a dedicated QueryClient for the shared report tree.
  // Global defaults prevent hooks from refetching to authenticated endpoints.
  // Cache is seeded synchronously in useMemo so data exists before children mount.
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
          cacheTime: Infinity,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          retry: false,
        },
      },
    });
    seedSharedReportCache(client, report);
    return client;
  }, [report]);

  // Set the Zustand store so child components that read from store work
  useEffect(() => {
    setActiveConcept(concept);
    return () => {
      setConceptUuid(undefined);
    };
  }, [concept, setActiveConcept, setConceptUuid]);

  const contextValue = useMemo(
    () => ({
      navigateToTab: onTabChange,
      concept,
      isReadOnly: true,
    }),
    [concept, onTabChange],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConceptReportContext.Provider value={contextValue}>
        {children}
      </ConceptReportContext.Provider>
    </QueryClientProvider>
  );
};

export default SharedReportProvider;
