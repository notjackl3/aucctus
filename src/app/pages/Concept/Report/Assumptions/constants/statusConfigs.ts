import { StatusConfig } from '../components/shared/GenericStatusBadge';

// Assumption status configurations
export const ASSUMPTION_STATUS_CONFIGS: Record<string, StatusConfig> = {
  validated: {
    bg: 'aucctus-bg-success-secondary',
    text: 'aucctus-text-success-primary',
    stroke: 'aucctus-stroke-success-primary',
    icon: 'check',
    label: 'Validated',
  },
  invalidated: {
    bg: 'aucctus-bg-error-secondary',
    text: 'aucctus-text-error-primary',
    stroke: 'aucctus-stroke-error-primary',
    icon: 'closeX',
    label: 'Invalidated',
  },
  partially_validated: {
    bg: 'aucctus-bg-warning-secondary',
    text: 'aucctus-text-warning-primary',
    stroke: 'aucctus-stroke-warning-primary',
    icon: 'help-circle',
    label: 'Partially Validated',
  },
  untested: {
    bg: 'aucctus-bg-secondary',
    text: 'aucctus-text-tertiary',
    stroke: 'aucctus-stroke-tertiary',
    icon: 'clipboard',
    label: 'Untested',
  },
};

// Test status configurations
export const TEST_STATUS_CONFIGS: Record<string, StatusConfig> = {
  completed: {
    bg: 'aucctus-bg-success-secondary',
    text: 'aucctus-text-success-primary',
    stroke: 'aucctus-stroke-success-primary',
    icon: 'check',
    label: 'Completed',
  },
  'in-progress': {
    bg: 'aucctus-bg-warning-secondary',
    text: 'aucctus-text-warning-primary',
    stroke: 'aucctus-stroke-warning-primary',
    icon: 'clock',
    label: 'In Progress',
  },
  planned: {
    bg: 'aucctus-bg-secondary',
    text: 'aucctus-text-tertiary',
    stroke: 'aucctus-stroke-tertiary',
    icon: 'clipboard',
    label: 'Planned',
  },
  failed: {
    bg: 'aucctus-bg-error-secondary',
    text: 'aucctus-text-error-primary',
    stroke: 'aucctus-stroke-error-primary',
    icon: 'closeX',
    label: 'Failed',
  },
};

// Risk level configurations
export const RISK_LEVEL_CONFIGS: Record<string, StatusConfig> = {
  high: {
    bg: 'aucctus-bg-error-secondary',
    text: 'aucctus-text-error-primary',
    stroke: 'aucctus-stroke-error-primary',
    icon: 'alert-triangle',
    label: 'High Risk',
  },
  medium: {
    bg: 'aucctus-bg-warning-secondary',
    text: 'aucctus-text-warning-primary',
    stroke: 'aucctus-stroke-warning-primary',
    icon: 'alert-circle',
    label: 'Medium Risk',
  },
  low: {
    bg: 'aucctus-bg-success-secondary',
    text: 'aucctus-text-success-primary',
    stroke: 'aucctus-stroke-success-primary',
    icon: 'check-circle-broken',
    label: 'Low Risk',
  },
};
