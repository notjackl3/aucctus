import { AssumptionCategory } from '@libs/api/types';

export interface CategoryProgressCardProps {
  category: AssumptionCategory;
  title: string;
  description: string;
  validationPercentage: number;
  isSelected?: boolean;
  onClick?: () => void;
  isInvalidated?: boolean;
}

export interface CategoryIconProps {
  category: AssumptionCategory;
}

export interface StatusBadgeProps {
  status?: string;
  category: string;
  percentage?: number;
}

export interface ProgressBarProps {
  category: AssumptionCategory;
  progress?: number;
  percentage?: number;
  isInvalidated?: boolean;
  className?: string;
  width: number;
}

export interface ThresholdMarkerProps {
  position: number;
}
