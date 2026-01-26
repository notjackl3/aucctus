/**
 * Admin API Type Definitions
 * For admin-only endpoints like metrics dashboard
 */

/**
 * Top concept data for metrics display
 */
export interface TopConcept {
  identifier: string;
  title: string;
  priorityScore: number;
  sam: number | null;
}

/**
 * Account metrics response from GET /api/v1/admin/metrics
 */
export interface AccountMetrics {
  // Critical Metrics
  lowValueInitiativesStopped: number;
  samIdentified: string;
  fasterDevelopmentPercentage: string;
  highPriorityConceptsCount: number;
  testsFromRecommendations: number;
  topConcepts: TopConcept[];

  // Important Metrics
  pipelineValue: string | null;
  hoursSaved: string | null;
  businessCasesDeveloped: number;
  usersByTeam: Record<string, number>;
  liveTestsLaunched: number;

  // Nice-to-Have Metrics
  assumptionsMapped: number;
  assumptionsTested: number;
  personasIdentified: number;
  personasTested: number;
  nucleusValidated: number;

  // Metadata
  periodStart: string | null;
  periodEnd: string | null;
  computedAt: string;
}

/**
 * Time range options for metrics filtering
 */
export type MetricsTimeRange = '7d' | '30d' | '90d' | 'all';

/**
 * Response from uploading account logo
 */
export interface AccountLogoUploadResponse {
  logoUrl: string;
  message: string;
}

/**
 * Summary metrics for a user in the leaderboard
 */
export interface UserMetricsSummary {
  userUuid: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  team: string | null;
  rank: number;
  activityScore: string;
  aiEditsApplied: number;
  conceptsCreated: number;
  testsLaunched: number;
  lastActive: string | null;

  // Quick win metrics (optional for backward compatibility)
  aiAcceptanceRate?: string | null; // Percentage of AI edits accepted (applied / total)
  daysActive?: number; // Count of distinct days with activity in time range
}

/**
 * Response from GET /api/v1/analytics/users
 */
export interface UserMetricsListResponse {
  users: UserMetricsSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  timeRange: string;
}

/**
 * Daily activity data for trend charts
 */
export interface DailyActivity {
  date: string;
  score: string;
}

/**
 * A recent activity event for the timeline
 */
export interface RecentEvent {
  eventType: string;
  pageType: string | null;
  timestamp: string;
  conceptUuid: string | null;
}

/**
 * Smart activity summary for meaningful display
 */
export type AdminActivitySummaryType =
  | 'ai_edit'
  | 'test_launch'
  | 'test_complete'
  | 'session';

export interface AdminActivitySummary {
  summaryType: AdminActivitySummaryType;
  title: string;
  description: string | null;
  timestamp: string;
  relativeTime: string;
  conceptUuid: string | null;
  conceptTitle: string | null;
  metadata: Record<string, unknown>;
}

/**
 * Detailed metrics for a specific user
 * Response from GET /api/v1/analytics/users/{user_uuid}
 */
export interface UserMetricsDetail {
  userUuid: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  team: string | null;
  rank: number;
  activityScore: string;

  // Counts
  aiEditsApplied: number;
  aiEditsRejected: number;
  conceptsCreated: number;
  conceptsViewed: number;
  conceptsEdited: number;
  testsLaunched: number;
  testsCompleted: number;

  // Section views - aggregated total
  sectionViewsTotal: number;

  // Section views - individual breakdown
  marketScanViews: number;
  customerProfileViews: number;
  ecosystemViews: number;
  assumptionsViews: number;
  trendsViews: number;
  financialProjectionViews: number;
  testDetailsViews: number;
  ideaPlaygroundViews: number;
  nucleusViews: number;

  // Activity data
  recentEvents: RecentEvent[];
  dailyActivity: DailyActivity[];

  // Smart activity summaries (preferred over recentEvents for display)
  activitySummaries?: AdminActivitySummary[];

  // Quick win metrics (optional for backward compatibility)
  aiAcceptanceRate?: string | null; // Percentage of AI edits accepted (applied / total)
  daysActive?: number; // Count of distinct days with activity in time range
  testsPerConcept?: string | null; // Average tests per concept created by user
  conceptsInReviewPlus?: number; // Concepts in advanced statuses (IN_REVIEW+)
  syntheticTestRatio?: string | null; // Percentage of test results that are synthetic
}
