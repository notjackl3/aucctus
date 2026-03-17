/**
 * Living Personas TypeScript Types
 *
 * Type definitions for all persona-related API operations.
 */

// ============================================
// Enums and Literals
// ============================================

export type PersonaConfidence = 'low' | 'medium' | 'high';
export type TagColor = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'teal';
export type TrendDirection = 'up' | 'down' | 'neutral';
export type ChartType = 'banking' | 'purchase' | 'asset';
export type EvidenceType = 'document' | 'survey' | 'analytics' | 'interview';
export type EvidenceRelevance = 'high' | 'medium' | 'low';
export type EvidenceStatus = 'pending' | 'accepted' | 'ignored';
export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ChatRole = 'user' | 'assistant';

// ============================================
// Core Persona Types
// ============================================

export interface IPersonaDemographics {
  geography?: string;
  ageRange?: string;
  familySize?: string;
  income?: string;
  education?: string;
  occupation?: string;
}

export interface IPersonaTag {
  uuid: string;
  label: string;
  color: TagColor;
}

export interface IPersonaJobToBeDone {
  uuid: string;
  text: string;
  priority: number;
  order: number;
}

export interface IPersonaPain {
  uuid: string;
  text: string;
  severity: number;
  order: number;
}

export interface IPersonaGain {
  uuid: string;
  text: string;
  impact: number;
  order: number;
}

export interface IPersonaSocialValue {
  uuid: string;
  title: string;
  description?: string;
  order: number;
}

export interface IPersonaMotivation {
  uuid: string;
  text: string;
  priority: number;
  order: number;
}

export interface IPersonaBehaviour {
  uuid: string;
  text: string;
  order: number;
}

export interface IPersonaKeyFact {
  uuid: string;
  stat: string;
  label: string;
  trend: TrendDirection;
  order: number;
}

export interface IPersonaQuote {
  uuid: string;
  text: string;
  context?: string;
  order: number;
}

export interface IPersonaWorkdayStep {
  uuid: string;
  time: string;
  title: string;
  description?: string;
  isProductIntervention: boolean;
  order: number;
}

export interface IPersonaChartData {
  uuid: string;
  chartType: ChartType;
  category: string;
  value: string;
  percentage: number;
  order: number;
}

// ============================================
// Persona List and Detail
// ============================================

export interface IPersonaListItem {
  uuid: string;
  name: string;
  segment: string;
  avatar?: string;
  themeColor?: string;
  confidence: PersonaConfidence;
  conceptCount: number;
  documentCount: number;
  lastEngagedAt?: string;
}

export interface IPersona {
  uuid: string;
  name: string;
  segment: string;
  avatar?: string;
  themeColor?: string;
  overview?: string;
  confidence: PersonaConfidence;
  createdAt: string;
  updatedAt: string;
  lastEngagedAt?: string;
  demographics?: IPersonaDemographics;
  tags: IPersonaTag[];
  jobsToBeDone: IPersonaJobToBeDone[];
  pains: IPersonaPain[];
  gains: IPersonaGain[];
  socialValues: IPersonaSocialValue[];
  motivations: IPersonaMotivation[];
  behaviours: IPersonaBehaviour[];
  keyFacts: IPersonaKeyFact[];
  quotes: IPersonaQuote[];
  workdaySteps: IPersonaWorkdayStep[];
  chartData: IPersonaChartData[];
  customWidgets: ICustomWidget[];
}

// ============================================
// Tagged Concepts
// ============================================

export interface ITaggedConcept {
  uuid: string;
  identifier: string;
  name: string;
  status: string;
  createdAt: string;
}

// ============================================
// Create and Update Payloads
// ============================================

export interface ICreatePersonaPayload {
  segment: string;
  name?: string;
  overview?: string;
  themeColor?: string;
  hasPendingDocuments?: boolean;
}

export interface IUpdatePersonaPayload {
  name?: string;
  segment?: string;
  overview?: string;
  themeColor?: string;
  confidence?: PersonaConfidence;
}

export interface ICreateTagPayload {
  label: string;
  color: TagColor;
}

export interface IUpdateDemographicsPayload {
  geography?: string;
  ageRange?: string;
  familySize?: string;
  income?: string;
  education?: string;
  occupation?: string;
}

export interface ICreateJobToBeDonePayload {
  text: string;
  priority?: number;
}

export interface IUpdateJobToBeDonePayload {
  text?: string;
  priority?: number;
}

export interface ICreatePainPayload {
  text: string;
  severity?: number;
}

export interface IUpdatePainPayload {
  text?: string;
  severity?: number;
}

export interface ICreateGainPayload {
  text: string;
  impact?: number;
}

export interface IUpdateGainPayload {
  text?: string;
  impact?: number;
}

export interface ICreateSocialValuePayload {
  title: string;
  description?: string;
}

export interface IUpdateSocialValuePayload {
  title?: string;
  description?: string;
}

export interface ICreateMotivationPayload {
  text: string;
  priority?: number;
}

export interface IUpdateMotivationPayload {
  text?: string;
  priority?: number;
}

export interface ICreateBehaviourPayload {
  text: string;
}

export interface IUpdateBehaviourPayload {
  text?: string;
}

export interface ICreateKeyFactPayload {
  stat: string;
  label: string;
  trend?: TrendDirection;
}

export interface IUpdateKeyFactPayload {
  stat?: string;
  label?: string;
  trend?: TrendDirection;
}

export interface ICreateQuotePayload {
  text: string;
  context?: string;
}

export interface IUpdateQuotePayload {
  text?: string;
  context?: string;
}

export interface ICreateWorkdayStepPayload {
  time: string;
  title: string;
  description?: string;
  isProductIntervention?: boolean;
}

export interface IUpdateWorkdayStepPayload {
  time?: string;
  title?: string;
  description?: string;
  isProductIntervention?: boolean;
}

export interface ICreateChartDataPayload {
  chartType: ChartType;
  category: string;
  value: string;
  percentage: number;
}

export interface IUpdateChartDataPayload {
  chartType?: ChartType;
  category?: string;
  value?: string;
  percentage?: number;
}

export interface IReorderItemsPayload {
  uuids: string[];
}

// ============================================
// Training Documents
// ============================================

export interface ITrainingDocument {
  uuid: string;
  filename: string;
  fileType: string;
  status: DocumentStatus;
  uploadedAt: string;
  processedAt?: string;
}

export interface ITrainingDocumentUploadResponse {
  uuid: string;
  filename: string;
  status: DocumentStatus;
  message: string;
}

// ============================================
// Evidence
// ============================================

export interface IEvidence {
  uuid: string;
  type: EvidenceType;
  title: string;
  source?: string;
  sourceTag?: string;
  excerpt?: string;
  relevance: EvidenceRelevance;
  suggestedUpdate?: string;
  targetField?: string;
  action?: 'add' | 'change' | 'inform';
  confidence?: number;
  status: EvidenceStatus;
  discoveredAt: string;
}

export interface IEvidenceActionResponse {
  message: string;
  evidenceUuid: string;
  status: EvidenceStatus;
}

// ============================================
// Chat
// ============================================

export interface IChatSession {
  uuid: string;
  title?: string;
  startedAt: string;
  endedAt?: string;
  messageCount: number;
}

export interface IChatSessionDetail extends IChatSession {
  messages: IChatMessage[];
}

export interface IChatMessage {
  uuid: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  mentions?: IMention[];
}

export interface IMention {
  uuid: string;
  name: string;
  type: 'concept' | 'persona';
}

export interface IStarterPrompt {
  uuid: string;
  text: string;
}

export interface IStarterPromptsResponse {
  prompts: IStarterPrompt[];
}

// ============================================
// Mention Search
// ============================================

export interface IMentionSearchResult {
  uuid: string;
  name: string;
  type: 'concept' | 'persona';
  avatar?: string;
  subtitle?: string;
}

export interface IMentionSearchResponse {
  results: IMentionSearchResult[];
}

// ============================================
// Conversation Search
// ============================================

export interface IPersonaConversationMessage {
  uuid: string;
  content: string;
  role: string;
  name: string;
  createdAt: string;
  contentSnippet?: string;
}

export interface IPersonaConversationSearchResult {
  uuid: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  sessionId: string;
  message?: IPersonaConversationMessage;
  matchingMessageCount?: number;
}

export interface IPersonaConversationSearchResponse {
  count: number;
  results: IPersonaConversationSearchResult[];
  numberOfPages: number;
  pageSize: number;
}

// ============================================
// API Response Wrappers
// ============================================

export interface IMessageResponse {
  message: string;
}

// ============================================
// Custom Widget Types
// ============================================

export type CustomWidgetType =
  | 'metric_chart'
  | 'timeline'
  | 'card_list'
  | 'stat_list';
export type MetricChartType = 'bar' | 'pie';

export type WidgetIconName =
  | 'bar-chart-3'
  | 'pie-chart'
  | 'trending-up'
  | 'users'
  | 'target'
  | 'dollar-sign'
  | 'shopping-cart'
  | 'building-2'
  | 'globe'
  | 'heart'
  | 'lightbulb'
  | 'clock'
  | 'map-pin'
  | 'briefcase'
  | 'star'
  | 'shield'
  | 'zap'
  | 'book-open'
  | 'activity'
  | 'award';

export interface IMetricChartItem {
  uuid: string;
  label: string;
  magnitude: number;
  unit: string;
  order: number;
}

export interface ITimelineEntry {
  uuid: string;
  label: string;
  labelIcon: string;
  title: string;
  description: string;
  order: number;
}

export interface ICardListItem {
  uuid: string;
  title: string;
  description: string;
  order: number;
}

export interface IStatListItem {
  uuid: string;
  title: string;
  description: string;
  trend: TrendDirection;
  order: number;
}

export interface ICustomWidget {
  uuid: string;
  widgetType: CustomWidgetType;
  title: string;
  description: string;
  icon: string;
  order: number;
  chartType?: MetricChartType;
  topScaleLabel?: string;
  bottomScaleLabel?: string;
  metricChartItems: IMetricChartItem[];
  timelineEntries: ITimelineEntry[];
  cardListItems: ICardListItem[];
  statListItems: IStatListItem[];
}

// Create/Update payloads
export interface ICreateCustomWidgetPayload {
  widgetType: CustomWidgetType;
  title: string;
  description?: string;
  icon?: string;
  chartType?: MetricChartType;
  topScaleLabel?: string;
  bottomScaleLabel?: string;
  initialItems?: ICreateWidgetItemPayload[];
}

export interface IUpdateCustomWidgetPayload {
  title?: string;
  description?: string;
  icon?: string;
  chartType?: MetricChartType;
  topScaleLabel?: string;
  bottomScaleLabel?: string;
}

export interface ICreateMetricChartItemPayload {
  label: string;
  magnitude: number;
  unit: string;
}
export interface IUpdateMetricChartItemPayload {
  label?: string;
  magnitude?: number;
  unit?: string;
  order?: number;
}
export interface ICreateTimelineEntryPayload {
  label: string;
  labelIcon?: string;
  title: string;
  description?: string;
}
export interface IUpdateTimelineEntryPayload {
  label?: string;
  labelIcon?: string;
  title?: string;
  description?: string;
  order?: number;
}
export interface ICreateCardListItemPayload {
  title: string;
  description?: string;
}
export interface IUpdateCardListItemPayload {
  title?: string;
  description?: string;
  order?: number;
}
export interface ICreateStatListItemPayload {
  title: string;
  description?: string;
  trend?: TrendDirection;
}
export interface IUpdateStatListItemPayload {
  title?: string;
  description?: string;
  trend?: TrendDirection;
  order?: number;
}

/** Generic widget item payload — union of all item fields. Used for initial_items on widget creation. */
export interface ICreateWidgetItemPayload {
  label?: string;
  magnitude?: number;
  unit?: string;
  labelIcon?: string;
  title?: string;
  description?: string;
  trend?: TrendDirection;
  order?: number;
}
