import { AssumptionCategory, AssumptionStatusV2 } from '@libs/api/types';

export interface CategoryProgressCardProps {
  category: AssumptionCategory;
  title: string;
  description: string;
  validationStatus: AssumptionStatusV2;
  validationPercentage?: number; // 0-1 range from API
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
