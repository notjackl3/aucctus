import React from 'react';
import { Badge } from '@components';

interface VersionCommentProps {
  comment?: string;
}

const VersionComment: React.FC<VersionCommentProps> = ({ comment }) => {
  const formattedComment = React.useMemo(() => {
    if (!comment) return undefined;

    // Extract sections and create a modified comment text
    const sectionRegex = /<section>(.*?)<\/section>/g;
    const sections = [...comment.matchAll(sectionRegex)];

    // Replace section tags with empty string to clean the comment
    const cleanedComment = comment.replace(sectionRegex, '').trim();

    return (
      <div className='flex flex-col gap-1'>
        {cleanedComment &&
          cleanedComment.split('\n').map((line, index) => (
            <span
              key={`line-${index}`}
              className='aucctus-text-secondary aucctus-text-sm'
            >
              {line}
            </span>
          ))}

        {sections.length > 0 && (
          <div className='mt-2 flex flex-row flex-wrap gap-2'>
            {sections.map((match, index) => (
              <Badge.Default
                key={`section-${index}`}
                value={match[1]}
                classNameBadge='aucctus-border-brand-primary aucctus-bg-brand-subtle border rounded-lg items-center justify-center'
                classNameLabel='aucctus-text-brand-primary aucctus-text-sm'
              />
            ))}
          </div>
        )}
      </div>
    );
  }, [comment]);

  return formattedComment || null;
};

export default VersionComment;
