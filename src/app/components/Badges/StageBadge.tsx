import React from 'react';
import { cn } from '@libs/utils/react';

export type ConceptStage = 'questions' | 'generate' | 'concepts';

interface StageBadgeProps {
  stage: ConceptStage;
}

const STAGE_STYLES: Record<ConceptStage, { bg: string; text: string }> = {
  questions: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  generate: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
  concepts: {
    bg: 'bg-green-50',
    text: 'text-green-700',
  },
};

const StageBadge: React.FC<StageBadgeProps> = ({ stage }) => {
  const styles = STAGE_STYLES[stage];

  return (
    <div
      className={cn(
        'flex w-fit items-center justify-center rounded-full px-3 py-1',
        styles.bg,
      )}
    >
      <span
        className={cn(
          'text-center text-xs font-medium capitalize',
          styles.text,
        )}
      >
        {stage}
      </span>
    </div>
  );
};

export default StageBadge;
