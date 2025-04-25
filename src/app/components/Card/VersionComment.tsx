import React from 'react';
import { Badge } from '@components';

interface VersionCommentProps {
  sections?: string[];
  comment?: string;
  editSummary?: string;
}

const VersionComment: React.FC<VersionCommentProps> = ({
  sections = [],
  editSummary = '',
  comment,
}) => {
  if (!comment) return null;

  return (
    <div className='flex flex-col gap-2'>
      {editSummary && (
        <span className='aucctus-text-primary aucctus-text-sm aucctus-border-brand-primary border-l-2 pl-2'>
          {editSummary}
        </span>
      )}

      {comment.split('\n').map((line, index) => (
        <span
          key={`line-${index}`}
          className='aucctus-text-tertiary aucctus-text-sm'
        >
          {line}
        </span>
      ))}

      {sections.length > 0 && (
        <div className='mt-2 flex flex-row flex-wrap gap-2'>
          {sections.map((section) => (
            <Badge.Default
              key={`section-${section}`}
              value={section}
              classNameBadge='aucctus-border-brand-primary aucctus-bg-brand-subtle border rounded-lg items-center justify-center'
              classNameLabel='aucctus-text-brand-primary aucctus-text-sm'
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VersionComment;
