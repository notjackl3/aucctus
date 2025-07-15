import React from 'react';
import { Badge } from '@components';
import type { ISource } from '@libs/api/types';

interface SourceBadgeListProps {
  sources: ISource[];
  className?: string;
  showPublishedDate?: boolean;
}

const SourceBadgeList: React.FC<SourceBadgeListProps> = ({
  sources,
  className = '',
  showPublishedDate = true,
}) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {sources.map((source) => (
        <Badge.SourceInfo
          key={source.uuid}
          badgeSize='small'
          badgeClassName='aucctus-text-primary whitespace-nowrap'
          source={source}
          onClick={() => window.open(source.url, '_blank')}
          showPublishedDate={showPublishedDate}
        />
      ))}
    </div>
  );
};

export default React.memo(SourceBadgeList);
