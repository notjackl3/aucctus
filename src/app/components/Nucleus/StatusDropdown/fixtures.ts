import { CategoryState, QuestionState } from './types';

// IconVariant type for the specific icons used
type IconVariant = 'check-circle-broken' | 'refresh' | 'alert-triangle';

export interface StatusOption {
  value: CategoryState | QuestionState;
  label: string;
  icon: IconVariant;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  hoverBgClass: string;
}

export const categoryStatusOptions: StatusOption[] = [
  {
    value: 'validated' as CategoryState,
    label: 'Validated',
    icon: 'check-circle-broken',
    colorClass: 'aucctus-text-success-primary',
    bgClass: 'aucctus-bg-success-secondary',
    borderClass: 'aucctus-border-success',
    hoverBgClass: 'aucctus-bg-success-primary-hover',
  },
  {
    value: 'new-details' as CategoryState,
    label: 'New Details',
    icon: 'refresh',
    colorClass: 'aucctus-text-brand-tertiary', // Using tertiary brand for blue
    bgClass: 'aucctus-bg-brand-secondary',
    borderClass: 'aucctus-border-brand',
    hoverBgClass: 'aucctus-bg-brand-primary-hover',
  },
  {
    value: 'needs-input' as CategoryState,
    label: 'Needs Input',
    icon: 'alert-triangle',
    colorClass: 'aucctus-text-warning-primary',
    bgClass: 'aucctus-bg-warning-secondary',
    borderClass: 'aucctus-border-warning-subtle',
    hoverBgClass: 'aucctus-bg-warning-primary-hover',
  },
];

export const questionStatusOptions: StatusOption[] = [
  {
    value: 'validated' as QuestionState,
    label: 'Validated',
    icon: 'check-circle-broken',
    colorClass: 'aucctus-text-success-primary',
    bgClass: 'aucctus-bg-success-secondary',
    borderClass: 'aucctus-border-success',
    hoverBgClass: 'aucctus-bg-success-primary-hover',
  },
  {
    value: 'new-detail' as QuestionState,
    label: 'New Detail',
    icon: 'refresh',
    colorClass: 'aucctus-text-brand-tertiary', // Using tertiary brand for blue
    bgClass: 'aucctus-bg-brand-secondary',
    borderClass: 'aucctus-border-brand',
    hoverBgClass: 'aucctus-bg-brand-primary-hover',
  },
  {
    value: 'needs-input' as QuestionState,
    label: 'Needs Input',
    icon: 'alert-triangle',
    colorClass: 'aucctus-text-warning-primary',
    bgClass: 'aucctus-bg-warning-secondary',
    borderClass: 'aucctus-border-warning-subtle',
    hoverBgClass: 'aucctus-bg-warning-primary-hover',
  },
];
