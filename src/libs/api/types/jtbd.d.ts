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
  | 'news';

export type JTBDWidgetType =
  | 'metric_chart'
  | 'trend_chart'
  | 'card_list'
  | 'stat_list'
  | 'social_post'
  | 'survey'
  | 'sparkline_stat'
  | 'market_sizing';

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
}

// ============================================
// Job Source Types
// ============================================

export interface IJTBDJobSource {
  uuid: string;
  title: string;
  url: string;
  sourceType: JTBDSourceType;
  citation: string;
  relevanceNote: string;
  publishedAt: string | null;
  createdAt: string;
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
  opportunityTier: OpportunityTier;
  evidenceStrength: number;

  // Market sizing
  tamValue: number | null;
  samValue: number | null;
  somValue: number | null;
  marketSizeLabel: string | null;

  displayOrder: number;
  createdAt: string;

  // Video
  videoUrl: string | null;

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
}

export interface IJTBDScanDetail extends IJTBDScan {
  jobs: IJTBDJob[];
}

export interface IJTBDActiveScan {
  uuid: string;
  status: string;
  stage?: string;
  progress?: number;
  message?: string;
  scannedAt: string;
}

// ============================================
// Config Types
// ============================================

export interface IJTBDRule {
  uuid: string;
  ruleText: string;
  isActive: boolean;
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
