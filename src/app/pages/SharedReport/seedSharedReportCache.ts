/**
 * Seeds the React Query cache with shared report data so that standard
 * concept report components (which call their own hooks) get cache hits
 * instead of firing authenticated API requests.
 *
 * Called synchronously from SharedReportProvider's useMemo (before children
 * render) with a dedicated QueryClient that has refetch-prevention defaults.
 * setQueryDefaults is NOT needed — the client-level defaults handle it.
 *
 * All keys are seeded unconditionally (null for missing sections) so hooks
 * see "data exists" and don't trigger initial fetches.
 */

import type { QueryClient } from 'react-query';
import type { ISharedReport } from '@libs/api/types/sharedReport';
import type { ICustomerProfile } from '@libs/api/types';
import type {
  IAssumptionV2,
  AssumptionCategory,
} from '@libs/api/types/concept/assumptions';
import { AucctusQueryKeys } from '@hooks/query/query-keys';

export function seedSharedReportCache(
  queryClient: QueryClient,
  report: ISharedReport,
): void {
  const uuid = report.concept.uuid;
  const identifier = report.concept.identifier;

  // Overview
  queryClient.setQueryData(
    [AucctusQueryKeys.conceptOverview, uuid],
    report.overview ?? null,
  );

  // Executive summaries
  queryClient.setQueryData(
    [AucctusQueryKeys.conceptExecutiveSummaries, uuid],
    report.executiveSummaries ?? null,
  );

  // Financial projection — seed both V1 and V2 keys since
  // FinancialProjectionsWrapper decides which to render based on featureVersions.
  const fp = report.financialProjection ?? null;
  queryClient.setQueryData([AucctusQueryKeys.financialProjection, uuid], fp);
  queryClient.setQueryData([AucctusQueryKeys.financialProjectionV2, uuid], fp);

  // Customer profiles — hook expects { results: ICustomerProfile[] }
  queryClient.setQueryData(
    [AucctusQueryKeys.customerProfiles, uuid],
    report.customerProfiles ? { results: report.customerProfiles } : null,
  );

  // Seed per-profile sub-entity keys so individual component hooks get cache hits
  if (report.customerProfiles) {
    for (const profile of report.customerProfiles) {
      seedCustomerProfileSubEntities(queryClient, profile);
    }
  }

  // Assumptions (V2 filtered) — hook key: [assumptions, 'filtered', identifier, filters]
  // Seed with testingAssumptions (V2 key assumptions), NOT report.assumptions (V1 legacy).
  // AssumptionsV2 component calls useFilteredAssumptions which queries the V2 key-assumptions endpoint.
  const v2Assumptions = report.testingAssumptions;
  const v2Data = v2Assumptions
    ? {
        results: v2Assumptions,
        count: v2Assumptions.length,
        numberOfPages: 1,
        pageSize: v2Assumptions.length,
        categoryMetrics: buildCategoryMetrics(v2Assumptions),
      }
    : null;

  // Seed all filter variants used by components:
  // - AssumptionsWrapper (full page): { page: 1, page_size: 199 }
  // - RecommendedTestSection (testing tab): { page: 1, page_size: 100 }
  // - AssumptionsCardWrapper (V1 overview carousel): { page: 1, page_size: 20 }
  // - ExecutiveDashboard (V2/V3 overview carousel): no filters (undefined)
  const filterVariants: (Record<string, number> | undefined)[] = [
    { page: 1, page_size: 199 },
    { page: 1, page_size: 100 },
    { page: 1, page_size: 20 },
    undefined,
  ];
  for (const filters of filterVariants) {
    queryClient.setQueryData(
      [AucctusQueryKeys.assumptions, 'filtered', identifier, filters],
      v2Data,
    );
  }

  // V1 assumptions key for legacy components
  queryClient.setQueryData(
    [AucctusQueryKeys.assumptions, uuid],
    report.assumptions ? { results: report.assumptions } : null,
  );

  // Assumption test status overview (used by AssumptionsV1)
  queryClient.setQueryData(
    [AucctusQueryKeys.assumptionTestStatusOverview, uuid],
    null,
  );

  // Market scan (V1/V2 combined data)
  queryClient.setQueryData(
    [AucctusQueryKeys.marketScan, uuid],
    report.marketScan ?? null,
  );

  // Market scan trends V3
  queryClient.setQueryData(
    [AucctusQueryKeys.marketScanTrendsV3, uuid],
    report.trends ?? null,
  );

  // Market forces V3
  queryClient.setQueryData(
    [AucctusQueryKeys.marketScanMarketForcesV3, uuid],
    report.marketForces ?? null,
  );

  // Priority insights V3
  queryClient.setQueryData(
    [AucctusQueryKeys.marketScanPriorityInsightsV3, uuid],
    report.priorityInsights ?? null,
  );

  // Ecosystem V2 — uses string key 'ecosystem-v2' (not from AucctusQueryKeys enum)
  queryClient.setQueryData(['ecosystem-v2', uuid], report.ecosystem ?? null);

  // Test details (list)
  queryClient.setQueryData(
    [AucctusQueryKeys.testDetails, uuid],
    report.testingTests ? { results: report.testingTests } : null,
  );

  // Individual test detail + sub-entity keys for TestExecutionModal tabs.
  // Seeds testDetail, testCollateral, testParticipants, testResults, and
  // testAssumptions so modal sub-tabs get cache hits instead of firing 401s.
  if (report.testingTests) {
    for (const test of report.testingTests) {
      queryClient.setQueryData(
        [AucctusQueryKeys.testDetail, uuid, test.uuid],
        test,
      );
      queryClient.setQueryData(
        [AucctusQueryKeys.testCollateral, uuid, test.uuid],
        { results: test.collaterals ?? [] },
      );
      queryClient.setQueryData(
        [AucctusQueryKeys.testParticipants, uuid, test.uuid],
        { results: test.participants ?? [] },
      );
      queryClient.setQueryData(
        [AucctusQueryKeys.testResults, uuid, test.uuid],
        { results: test.results ?? [] },
      );
      queryClient.setQueryData(
        [AucctusQueryKeys.testAssumptions, uuid, test.uuid],
        { results: test.assumptions ?? [] },
      );
    }
  }
}

/**
 * Compute categoryMetrics from raw assumptions data.
 * Mirrors the server-side aggregation so the ExecutiveDashboard
 * overview card can display risk categories without an API call.
 */
function buildCategoryMetrics(assumptions: IAssumptionV2[]): Record<
  string,
  {
    category: AssumptionCategory;
    count: number;
    cumulativeCertainty: number;
    cumulativeImportance: number;
    averageRisk: number;
    validationStatus: string;
    validationPercentage: number;
  }
> {
  const groups: Record<string, IAssumptionV2[]> = {};
  for (const a of assumptions) {
    if (!groups[a.category]) groups[a.category] = [];
    groups[a.category].push(a);
  }

  const result: Record<
    string,
    {
      category: AssumptionCategory;
      count: number;
      cumulativeCertainty: number;
      cumulativeImportance: number;
      averageRisk: number;
      validationStatus: string;
      validationPercentage: number;
    }
  > = {};

  for (const [cat, items] of Object.entries(groups)) {
    const count = items.length;
    const cumulativeCertainty = items.reduce((s, a) => s + a.certainty, 0);
    const cumulativeImportance = items.reduce((s, a) => s + a.importance, 0);
    const averageRisk = items.reduce((s, a) => s + a.risk, 0) / count;
    const validatedCount = items.filter(
      (a) =>
        a.validationStatus === 'validated' ||
        a.validationStatus === 'partially_validated',
    ).length;
    const validationPercentage = validatedCount / count;

    const allValidated = items.every((a) => a.validationStatus === 'validated');
    const anyInvalidated = items.some(
      (a) => a.validationStatus === 'invalidated',
    );
    const validationStatus = allValidated
      ? 'validated'
      : anyInvalidated
        ? 'invalidated'
        : validatedCount > 0
          ? 'partially_validated'
          : 'untested';

    result[cat] = {
      category: cat as AssumptionCategory,
      count,
      cumulativeCertainty,
      cumulativeImportance,
      averageRisk,
      validationStatus,
      validationPercentage,
    };
  }
  return result;
}

/**
 * Seed all sub-entity query keys for a single customer profile.
 * Each sub-component (CustomerJobs, CustomerPains, CustomerAlternatives, etc.)
 * calls its own hook with key [customerProfile, profileUuid, 'entityType'].
 * Seeding these prevents 401s from authenticated endpoint requests.
 */
function seedCustomerProfileSubEntities(
  queryClient: QueryClient,
  profile: ICustomerProfile,
): void {
  const id = profile.uuid;

  // Sub-entity keys — use data from profile where available, empty arrays otherwise
  queryClient.setQueryData(
    [AucctusQueryKeys.customerProfile, id, 'jobs'],
    profile.jobs ?? [],
  );
  queryClient.setQueryData(
    [AucctusQueryKeys.customerProfile, id, 'pains'],
    profile.pains ?? [],
  );
  queryClient.setQueryData(
    [AucctusQueryKeys.customerProfile, id, 'alternatives'],
    profile.alternatives ?? [],
  );
  queryClient.setQueryData(
    [AucctusQueryKeys.customerProfile, id, 'journey-steps'],
    profile.journeySteps ?? profile.journey ?? [],
  );
  queryClient.setQueryData(
    [AucctusQueryKeys.customerProfile, id, 'social-values'],
    profile.socialValues ?? [],
  );
  queryClient.setQueryData(
    [AucctusQueryKeys.customerProfile, id, 'motivations'],
    profile.motivations ?? [],
  );
  queryClient.setQueryData(
    [AucctusQueryKeys.customerProfile, id, 'behaviours'],
    profile.behaviours ?? [],
  );
  queryClient.setQueryData(
    [AucctusQueryKeys.customerProfile, id, 'key-facts'],
    profile.keyFacts ?? [],
  );
  queryClient.setQueryData(
    [AucctusQueryKeys.customerProfile, id, 'quotes'],
    profile.quotes ?? [],
  );

  // Conversation list — seed empty so the hook doesn't fire a 401.
  // Hook key is [key, profileUuid, filterOptions?.message, filterOptions?.page].
  // Default call has no filterOptions, so trailing entries are undefined and
  // dropped by React Query v3 serialisation — match with just [key, id].
  queryClient.setQueryData(
    [AucctusQueryKeys.customerProfileConversationSearch, id],
    { results: [] },
  );
}
