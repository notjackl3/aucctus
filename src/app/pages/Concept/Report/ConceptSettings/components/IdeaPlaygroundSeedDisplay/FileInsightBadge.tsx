import React from 'react';
import { Badge } from '@components';
import type { ISavedFileInsight } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { FileText } from 'lucide-react';

interface FileInsightBadgeProps {
  insight: ISavedFileInsight;
}

/**
 * FileInsightBadge - Displays an insight extracted from an uploaded document
 */
export const FileInsightBadge: React.FC<FileInsightBadgeProps> = ({
  insight,
}) => {
  return (
    <div
      className={cn(
        'group relative rounded-lg border transition-all duration-200',
        'aucctus-bg-secondary aucctus-border-secondary',
        'hover:aucctus-bg-tertiary hover:shadow-sm',
      )}
    >
      <div className='p-3.5'>
        {/* Insight text */}
        <p className='aucctus-text-sm aucctus-text-primary mb-3 leading-relaxed'>
          {insight.insight}
        </p>

        {/* Footer with source info */}
        <div className='flex items-center gap-2'>
          <Badge.WithIcon className='aucctus-bg-tertiary aucctus-border-tertiary aucctus-text-xs aucctus-text-tertiary'>
            <FileText size={10} className='aucctus-stroke-tertiary' />
            <span>{insight.sourceTitle}</span>
          </Badge.WithIcon>
        </div>
      </div>
    </div>
  );
};
