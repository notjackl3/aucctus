/**
 * Analytics API Type Definitions
 * For user activity metrics responses from the API
 *
 * Note: Analytics events are now tracked server-side via the @track_activity decorator.
 * The frontend no longer sends analytics events via WebSocket.
 */

// ----------------
// Event Types (for API responses)
// ----------------

/**
 * Types of activity events tracked by the backend
 */
export type AnalyticsEventType =
  | 'ai_edit_apply'
  | 'ai_edit_reject'
  | 'concept_view'
  | 'concept_edit'
  | 'test_launch'
  | 'test_complete'
  | 'test_results_view'
  | 'nucleus_view'
  | 'feature_use';

/**
 * Types of pages tracked by the backend
 */
export type PageType =
  | 'dashboard'
  | 'idea_playground'
  | 'concept_bank'
  | 'concept_overview'
  | 'concept_market_scan'
  | 'concept_testing'
  | 'concept_customer_profile'
  | 'concept_financial_projection'
  | 'nucleus'
  | 'settings'
  | 'idea_submissions_admin'
  | 'idea_submissions_detail'
  | 'signal_scanning'
  | 'other';

// ----------------
// API Response Types
// ----------------

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
  eventType: AnalyticsEventType;
  pageType: PageType | null;
  timestamp: string;
  conceptUuid: string | null;
}

/**
 * Smart activity summary for meaningful display
 */
export type ActivitySummaryType =
  | 'ai_edit'
  | 'test_launch'
  | 'test_complete'
  | 'session';

export interface ActivitySummary {
  summaryType: ActivitySummaryType;
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

  // Activity data (raw events - deprecated, use activitySummaries)
  recentEvents: RecentEvent[];
  dailyActivity: DailyActivity[];

  // Smart activity summaries (preferred over recentEvents)
  activitySummaries?: ActivitySummary[];

  // Quick win metrics (optional for backward compatibility)
  aiAcceptanceRate?: string | null; // Percentage of AI edits accepted (applied / total)
  daysActive?: number; // Count of distinct days with activity in time range
  testsPerConcept?: string | null; // Average tests per concept created by user
  conceptsInReviewPlus?: number; // Concepts in advanced statuses (IN_REVIEW+)
  syntheticTestRatio?: string | null; // Percentage of test results that are synthetic
}
