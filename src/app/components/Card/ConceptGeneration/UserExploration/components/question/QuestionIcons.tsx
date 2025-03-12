import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

// Shadow style shared across components
export const boxShadowStyle = {
  boxShadow: `0px -2px 0px 0px rgba(20, 20, 20, 0.05) inset, 0px 1px 4px rgba(0, 0, 0, 0.05)`,
};

// Icon mapping for question types
export const questionIconVariantMap: Record<string, IconVariant> = {
  problemStatement: 'alert-circle',
  reachUsers: 'route',
  targetProfiles: 'user-group',
  valueCreation: 'currency-dollar',
};

interface CompletionIconProps {
  className?: string;
}

export const CompletionIcon = ({ className }: CompletionIconProps) => (
  <span
    style={boxShadowStyle}
    className={cn(
      'aucctus-bg-secondary aucctus-border-primary z-[10] ml-2 flex h-8 w-8 items-center justify-center rounded-md border stroke-primary-600 p-2',
    )}
  >
    <Icon className={className} variant='check' />
  </span>
);

export const QuestionIcon = ({
  questionType,
  className,
  innerRef,
}: {
  questionType: string;
  className?: string;
  innerRef?: React.RefObject<HTMLSpanElement>;
}) => (
  <span
    ref={innerRef}
    style={boxShadowStyle}
    className={cn(
      'aucctus-bg-primary aucctus-border-primary ml-1 flex h-10 w-10 items-center justify-center rounded-lg border stroke-primary-600 p-2',
      className,
    )}
  >
    <Icon variant={questionIconVariantMap[questionType] || 'help-circle'} />
  </span>
);
