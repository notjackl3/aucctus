import React from 'react';
import { cn } from '@libs/utils/react';
import { Sparkles, UserSquare } from 'lucide-react';
interface AnswerSourceBadgeProps {
  isAiGenerated: boolean;
  className?: string;
}

const AnswerSourceBadge: React.FC<AnswerSourceBadgeProps> = ({
  isAiGenerated,
  className = '',
}) => {
  if (isAiGenerated) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2 py-1',
          'aucctus-bg-brand-secondary aucctus-border-brand border',
          'aucctus-text-brand-primary aucctus-text-xs font-medium',
          className,
        )}
      >
        <Sparkles className='aucctus-stroke-brand-primary h-3 w-3' />
        <span>AI</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-1',
        'aucctus-bg-secondary aucctus-border-secondary border',
        'aucctus-text-secondary aucctus-text-xs font-medium',
        className,
      )}
    >
      <UserSquare className='aucctus-stroke-secondary h-3 w-3' />
      <span>User</span>
    </div>
  );
};

export default React.memo(AnswerSourceBadge);
