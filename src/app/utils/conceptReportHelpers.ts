import { ConceptReportStatusBySection } from '@libs/api/types';

export const CONCEPT_REPORT_STAGE_ORDER = [
  { key: 'marketScan', label: 'Market Scan' },
  { key: 'trends', label: 'Trends' },
  { key: 'customerProfiles', label: 'Customer Profiles' },
  { key: 'financialProjection', label: 'Financial Projection' },
  { key: 'assumptions', label: 'Key Assumptions' },
  { key: 'overview', label: 'Overview' },
] as const;

export type ConceptReportStageKey =
  (typeof CONCEPT_REPORT_STAGE_ORDER)[number]['key'];
export type ConceptReportStageStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'error';

export interface ConceptReportStage {
  key: ConceptReportStageKey;
  label: string;
  status: ConceptReportStageStatus;
}

export const DEFAULT_CONCEPT_REPORT_ESTIMATE_SECONDS = 20 * 60;

const STAGE_KEYWORDS: Record<ConceptReportStageKey, string[]> = {
  marketScan: ['market scan'],
  trends: ['trend'],
  customerProfiles: ['customer profile', 'customers'],
  financialProjection: ['financial projection', 'financial'],
  assumptions: ['assumption'],
  overview: ['overview'],
};

const PROGRESS_TRACKED_STAGE_KEYS: ConceptReportStageKey[] = [
  'marketScan',
  'customerProfiles',
  'financialProjection',
  'assumptions',
  'overview',
];

export const stageKeyFromMessage = (
  message?: string,
): ConceptReportStageKey | undefined => {
  if (!message) return undefined;
  const normalized = message.toLowerCase();
  return (Object.keys(STAGE_KEYWORDS) as ConceptReportStageKey[]).find(
    (stageKey) =>
      STAGE_KEYWORDS[stageKey].some((keyword) => normalized.includes(keyword)),
  );
};

export const createStageMessage = (
  stageKey: ConceptReportStageKey | undefined,
  eventType?: string,
): string | undefined => {
  if (!stageKey) return undefined;
  const baseLabel =
    CONCEPT_REPORT_STAGE_ORDER.find((stage) => stage.key === stageKey)?.label ||
    '';

  if (!baseLabel) return undefined;

  if (eventType === 'section_completed') {
    return `${baseLabel} completed`;
  }
  if (eventType === 'workflow_completed') {
    return 'Concept report ready';
  }
  if (eventType === 'workflow_error') {
    return `${baseLabel} encountered an error`;
  }
  return `${baseLabel} in progress`;
};

export const buildStageStatuses = (
  reportStatusBySection: ConceptReportStatusBySection | undefined,
  activeStage?: ConceptReportStageKey,
): ConceptReportStage[] => {
  return CONCEPT_REPORT_STAGE_ORDER.map(({ key, label }) => {
    const rawStatus = reportStatusBySection?.[key]?.status;

    let status: ConceptReportStageStatus = 'pending';

    if (rawStatus === 'complete') {
      status = 'completed';
    } else if (rawStatus === 'error') {
      status = 'error';
    } else if (rawStatus === 'pending') {
      status = 'active';
    } else if (activeStage === key) {
      status = 'active';
    }

    return { key, label, status };
  });
};

export const computeProgressFromSections = (
  reportStatusBySection: ConceptReportStatusBySection | undefined,
) => {
  const totalCount = PROGRESS_TRACKED_STAGE_KEYS.length;
  if (!reportStatusBySection) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount,
    };
  }

  const completedCount = PROGRESS_TRACKED_STAGE_KEYS.filter(
    (key) => reportStatusBySection[key]?.status === 'complete',
  ).length;

  const percentage = Math.round((completedCount / totalCount) * 100);

  return {
    percentage,
    completedCount,
    totalCount,
  };
};
