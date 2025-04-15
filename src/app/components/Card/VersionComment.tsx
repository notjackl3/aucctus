import React from 'react';
import { Badge } from '@components';

interface VersionCommentProps {
  sections?: string[];
  comment?: string;
}

const VersionComment: React.FC<VersionCommentProps> = ({
  sections = [],
  comment,
}) => {
  const formattedComment = React.useMemo(() => {
    if (!comment) return undefined;

    return (
      <div className='flex flex-col gap-1'>
        {comment &&
          comment.split('\n').map((line, index) => (
            <span
              key={`line-${index}`}
              className='aucctus-text-secondary aucctus-text-sm'
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
  }, [comment, sections]);

  return formattedComment || null;
};

export default VersionComment;
