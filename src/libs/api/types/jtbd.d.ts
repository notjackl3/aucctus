/**
 * JTBD Canvas API Types
 *
 * Types for the Jobs-To-Be-Done Canvas feature including:
 * - Configs (with rules and documents)
 * - Scans and Jobs
 * - Custom Widgets (6 polymorphic types)
 * - Sources and market sizing
 */

// ============================================
// Enum Types
// ============================================

export type JTBDSegment = 'b2c' | 'b2b';

export type JTBDMarketType = 'existing' | 'new';

export type OpportunityTier = 'high' | 'medium' | 'low';

export type JTBDScanStatus = 'pending' | 'running' | 'completed' | 'failed';

export type JTBDSourceType =
  | 'search'
  | 'social'
  | 'complaint'
  | 'survey'
  | 'market_report'
  | 'news'
  | 'patent'
  | 'research_paper'
  | 'conference_proceeding'
  | 'clinical_report'
  | 'trade_publication'
  | 'document';

export type JTBDWidgetType =
  | 'metric_chart'
  | 'trend_chart'
  | 'card_list'
  | 'stat_list'
  | 'social_post'
  | 'survey'
  | 'sparkline_stat'
  | 'market_sizing'
  | 'note';

export type JTBDChartType = 'bar' | 'pie';

export type JTBDTrend = 'up' | 'down' | 'stable';

export type JTBDSocialPlatform =
  | 'reddit'
  | 'x'
  | 'facebook'
  | 'linkedin'
  | 'tiktok'
  | 'other';

export type LucideIconName =
  | 'activity'
  | 'alert-triangle'
  | 'award'
  | 'bar-chart-3'
  | 'book-open'
  | 'briefcase'
  | 'building'
  | 'calendar'
  | 'chart-column'
  | 'clipboard-list'
  | 'clock'
  | 'compass'
  | 'database'
  | 'dollar-sign'
  | 'globe'
  | 'heart'
  | 'layers'
  | 'lightbulb'
  | 'line-chart'
  | 'list'
  | 'map'
  | 'message-circle'
  | 'pie-chart'
  | 'puzzle'
  | 'radar'
  | 'rocket'
  | 'search'
  | 'shield'
  | 'shield-check'
  | 'smartphone'
  | 'sparkles'
  | 'star'
  | 'target'
  | 'telescope'
  | 'thermometer'
  | 'trending-up'
  | 'trending-down'
  | 'users'
  | 'zap'
  | 'waves';

// ============================================
// Widget Item Types
// ============================================

export interface IJTBDItemSource {
  sourceLabel: string;
  sourceUrl: string;
  sourceType?: string;
  metricsContributed: string;
}

export interface IJTBDMetricChartItem {
  uuid: string;
  label: string;
  magnitude: number;
  unit: string;
  sources: IJTBDItemSource[];
  displayOrder: number;
}

export interface IJTBDTrendChartItem {
  uuid: string;
  period: string;
  value: number;
  label: string;
  sources: IJTBDItemSource[];
  displayOrder: number;
}

export interface IJTBDCardListItem {
  uuid: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  sources: IJTBDItemSource[];
  displayOrder: number;
}

export interface IJTBDStatListItem {
  uuid: string;
  title: string;
  description: string;
  trend: JTBDTrend;
  sources: IJTBDItemSource[];
  displayOrder: number;
}

export interface IJTBDSocialPostItem {
  uuid: string;
  platform: JTBDSocialPlatform;
  author: string;
  content: string;
  sourceUrl: string;
  sourceLabel: string;
  engagementCount: number;
  engagementLabel: string;
  subredditOrChannel: string;
  displayOrder: number;
  postedAt: string | null;
}

export interface IJTBDSurveyItem {
  uuid: string;
  question: string;
  responseSummary: string;
  sampleSize: number | null;
  sources: IJTBDItemSource[];
  displayOrder: number;
}

export interface IJTBDSparklineStatItem {
  uuid: string;
  changeValue: string;
  changeDirection: JTBDTrend;
  periodLabel: string;
  sparklineData: number[];
  keywordTags: string[];
  sources: IJTBDItemSource[];
  displayOrder: number;
}

export interface IJTBDMarketSizingItem {
  uuid: string;
  metric: 'tam' | 'sam' | 'som';
  label: string;
  value: number | null;
  formattedValue: string;
  description: string;
  sources: IJTBDItemSource[];
  displayOrder: number;
}

/**
 * User-authored note attached to a JTBD job.
 * Notes live on a `note`-type widget; they are NOT AI-authored and survive
 * job re-assessment / cumulative-merge job supersession on the backend.
 */
export interface IJTBDNoteItem {
  uuid: string;
  body: string;
  /** UUID of the user who created the note (null if the user was removed). */
  createdByUuid: string | null;
  /** Display name of the author, resolved server-side. */
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  displayOrder: number;
}

// ============================================
// Custom Widget Type (flat polymorphic)
// ============================================

export interface IJTBDCustomWidget {
  uuid: string;
  widgetType: JTBDWidgetType;
  title: string;
  description: string;
  icon: LucideIconName;
  displayOrder: number;
  chartType: JTBDChartType | null;
  topScaleLabel: string;
  bottomScaleLabel: string;
  metricChartItems: IJTBDMetricChartItem[];
  trendChartItems: IJTBDTrendChartItem[];
  cardListItems: IJTBDCardListItem[];
  statListItems: IJTBDStatListItem[];
  socialPostItems: IJTBDSocialPostItem[];
  surveyItems: IJTBDSurveyItem[];
  sparklineStatItems: IJTBDSparklineStatItem[];
  marketSizingItems: IJTBDMarketSizingItem[];
  noteItems: IJTBDNoteItem[];
}

// ============================================
// Constraint Source Types
// ============================================

export interface IJTBDConstraintSource {
  sourceLabel: string;
  sourceUrl: string;
  sourceType?: string;
  field: 'root_constraint' | 'solution_landscape' | 'capability_fit' | 'widget';
  snippet?: string;
}

// ============================================
// Job Types
// ============================================

export interface IJTBDJob {
  uuid: string;
  jtbdTitle: string;
  persona: string;
  desire: string;
  outcome: string;
  segment: JTBDSegment;
  summary: string;
  report: string;
  marketType: JTBDMarketType;

  // Aggregate scores
  opportunityScore: number;
  opportunityReasoning: string;
  opportunityTier: OpportunityTier;
  evidenceStrength: number;
  evidenceStrengthReasoning: string;
  differentiationScore: number | null;

  // Market sizing
  marketSizeLabel: string | null;

  // Constraint & landscape analysis
  rootConstraint: string;
  solutionLandscape: string;
  capabilityFit: string;

  // Source corroboration
  sourceTypeCount: number;
  corroborationLabel: string;

  displayOrder: number;
  createdAt: string;
  agentLastUpdated: string | null;
  mergedFromScanUuid: string | null;
  mergeRationale: string | null;

  // Video
  videoUrl: string | null;

  // Constraint sources
  constraintSources: IJTBDConstraintSource[];

  // Nested relations
  customWidgets: IJTBDCustomWidget[];
}

// ============================================
// Scan Types
// ============================================

export interface IJTBDScan {
  uuid: string;
  status: JTBDScanStatus;
  isCurrent: boolean;
  jobsDiscovered: number;
  scannedAt: string;
  completedAt: string | null;
  jobCount?: number;
}

export interface IJTBDScanDetail extends IJTBDScan {
  jobs: IJTBDJob[];
}

export interface IJTBDActiveScan {
  uuid: string;
  status: string;
  scannedAt: string;
}

// ============================================
// Config Types
// ============================================

export interface IJTBDRule {
  uuid: string;
  ruleText: string;
}

export interface IJTBDConfigDocument {
  uuid: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}

export interface IJTBDConfigList {
  uuid: string;
  name: string;
  personaUuids: string[];
  rulesCount: number;
  documentsCount: number;
  lastScanAt: string | null;
  isScanning: boolean;
  lastScanStatus?: JTBDScanStatus;
  lastScanError?: string;
  /**
   * Job UUIDs with an Ask Aucctus edit currently in flight for this config.
   * Populated from backend Redis-backed edit tracking; hydrates the per-job
   * editing badge + rescan-button gate after a page refresh and carries
   * cross-client state alongside the WS event stream.
   */
  activeEditJobUuids: string[];
}

export interface IJTBDConfigDetail {
  uuid: string;
  name: string;
  description: string;
  personaUuids: string[];
  retentionDays: number;
  rules: IJTBDRule[];
  documents: IJTBDConfigDocument[];
  createdAt: string;
  lastScanAt: string | null;
  isScanning: boolean;
  lastScanStatus?: JTBDScanStatus;
  lastScanError?: string;
  /**
   * Job UUIDs with an Ask Aucctus edit currently in flight for this config.
   * See `IJTBDConfigList.activeEditJobUuids` — identical semantics.
   */
  activeEditJobUuids: string[];
}

// ============================================
// Request Payload Types
// ============================================

export interface ICreateJTBDConfigPayload {
  name: string;
  description?: string;
  personaUuids?: string[];
  rules?: string[];
}

export interface IUpdateJTBDConfigPayload {
  name?: string;
  description?: string;
  personaUuids?: string[];
}

export interface IAddJTBDRulePayload {
  ruleText: string;
}

export interface IUpdateJTBDRulePayload {
  ruleText?: string;
  isActive?: boolean;
}

/**
 * Payload for creating a user-authored note on a JTBD job.
 */
export interface ICreateJTBDNotePayload {
  body: string;
}

/**
 * Payload for updating an existing user-authored note.
 */
export interface IUpdateJTBDNotePayload {
  body: string;
}

// ============================================
// Response Types
// ============================================

export interface IJTBDRefreshResponse {
  taskId: string;
  message: string;
}

export interface IJTBDMessageResponse {
  detail: string;
}

export interface IJTBDIdeateResponse {
  seedUuid: string;
  message: string;
}

// ============================================
// Rule Generation Types
// ============================================

export interface IJTBDGeneratedRule {
  ruleText: string;
  suggestedPersonaUuid: string | null;
}

export interface IJTBDRuleGenerationResponse {
  taskId: string;
  message: string;
}

// ============================================
// Unified Job Edit Types
// ============================================

/**
 * Scope discriminator for the unified `POST /jtbd/jobs/{uuid}/edit/` endpoint.
 * Mirrors the carousel-level `IJTBDJobEditScope` in `ai-editing.d.ts` but
 * lives here for API-layer consumers that don't want to depend on the
 * carousel types module.
 */
export type IJTBDEditJobScope =
  | { kind: 'widget'; widgetUuid: string }
  | { kind: 'job' }
  | { kind: 'widget_add' }
  | {
      kind: 'constraint_field';
      field: 'root_constraint' | 'solution_landscape';
    };

/**
 * Request body for the unified job-edit endpoint. `userMessage` is the raw
 * user text (as surfaced in the Overseer chat) while
 * `agentImplementationInstructions` is the agent-authored, actionable
 * restatement used by the downstream research agent.
 */
export interface IJTBDEditJobRequest {
  userMessage: string;
  agentImplementationInstructions: string;
  scope: IJTBDEditJobScope;
}

/**
 * 202 response — the request was queued. The refreshed job arrives later
 * via the `jtbd.job.edited.account` WebSocket event.
 */
export interface IJTBDEditJobResponse {
  taskId: string;
  jobUuid: string;
}

// ============================================
// Unified Job Merge Types
// ============================================

/**
 * Request body for `POST /jtbd/jobs/{primary_uuid}/merge/`.
 * `userMessage` is the user-facing description (as shown on the carousel
 * card); `mergeInstructions` is the optional agent-authored guidance for the
 * merge pipeline; `secondaryJobUuids` lists the jobs to merge into the
 * primary (1-4 secondaries). Either text field may be empty/null.
 */
export interface IJTBDMergeJobsRequest {
  userMessage: string;
  mergeInstructions: string | null;
  secondaryJobUuids: string[];
}

/**
 * 202 response — the merge pipeline was queued. The refreshed primary job
 * arrives later via the `jtbd.jobs.merged.account` WebSocket event; the
 * secondary jobs are deleted once the merge completes.
 */
export interface IJTBDMergeJobsAccepted {
  taskId: string;
  primaryJobUuid: string;
  secondaryJobUuids: string[];
}

// ============================================
// Ideation Types
// ============================================

/**
 * Wire-level payload for `POST /jtbd/jobs/{job_uuid}/ideate/`. Distinct from
 * the carousel-level `IJTBDIdeatePayload` in `ai-editing.d.ts`, which carries
 * the target `jobUuid` alongside the instructions.
 */
export interface IJTBDIdeateRequest {
  generationInstructions?: string;
}
