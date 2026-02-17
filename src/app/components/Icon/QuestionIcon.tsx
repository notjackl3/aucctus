import { resolveIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import React from 'react';

// Shadow style shared across components
export const boxShadowStyle = {
  boxShadow: `0px -2px 0px 0px rgba(20, 20, 20, 0.05) inset, 0px 1px 4px rgba(0, 0, 0, 0.05)`,
};

// Icon mapping for question types
export const questionIconVariantMap: Record<string, string> = {
  problemStatement: 'alert-circle',
  businessModel: 'route',
  targetProfiles: 'user-group',
  valueCreation: 'currency-dollar',
  internalProfiles: 'dataflow-04',
  businessTypes: 'building-02',
  businessPersonas: 'user-square',
  consumerProfiles: 'user-group',
};

export const QuestionIcon: React.FC<{
  questionType: string;
  className?: string;
  innerRef?: React.RefObject<HTMLSpanElement>;
  variant?: string;
}> = ({ questionType, className, innerRef, variant }) => {
  const IconComponent = resolveIcon(
    variant || questionIconVariantMap[questionType] || 'help-circle',
  );
  return (
    <span
      ref={innerRef}
      style={boxShadowStyle}
      className={cn(
        'aucctus-bg-primary aucctus-border-primary ml-1 flex h-10 w-10 items-center justify-center rounded-lg border stroke-primary-600 p-2',
        className,
      )}
    >
      <IconComponent size={18} />
    </span>
  );
};
