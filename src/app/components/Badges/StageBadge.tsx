import React from 'react';
import { cn } from '@libs/utils/react';

export type ConceptStage = 'questions' | 'generate' | 'concepts';

interface StageBadgeProps {
  stage: ConceptStage;
}

// Width settings based on the CSS specifications
const STAGE_WIDTH: Record<ConceptStage, string> = {
  questions: 'min-w-[68px]',
  generate: 'min-w-[72px]',
  concepts: 'min-w-[64px]',
};

const STAGE_STYLES: Record<
  ConceptStage,
  { bg: string; text: string; border: string }
> = {
  questions: {
    bg: 'bg-blue-50',
    text: 'text-blue-700', // #175CD3 in tailwind config
    border: 'border border-blue-200',
  },
  generate: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700', // #3538CD in tailwind config
    border: 'border border-indigo-200',
  },
  concepts: {
    bg: 'bg-success-50',
    text: 'text-success-700', // #067647 in tailwind config
    border: 'border border-success-200',
  },
};

const StageBadge: React.FC<StageBadgeProps> = ({ stage }) => {
  const styles = STAGE_STYLES[stage];
  const widthClass = STAGE_WIDTH[stage];

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full px-4 py-1.5',
        widthClass,
        styles.bg,
        styles.border,
      )}
    >
      <span
        className={cn(
          'font-inter h-[20px] text-center text-sm font-medium capitalize leading-[20px]',
          styles.text,
        )}
      >
        {stage}
      </span>
    </div>
  );
};

export default StageBadge;
