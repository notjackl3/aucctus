import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
interface SourceBadgesProps {
  sources: string[];
  onSourceClick?: (source: string) => void;
}

/**
 * SourceBadges component displays a list of source files with download capability.
 * Initially shows a compact "Sources" button, which expands to show individual files.
 */
const SourceBadges: React.FC<SourceBadgesProps> = ({
  sources,
  onSourceClick,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button
        className='aucctus-bg-secondary-hover inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors'
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(true);
        }}
      >
        <div className='flex -space-x-1.5'>
          {sources.slice(0, 4).map((_, idx) => (
            <div
              key={idx}
              className='aucctus-bg-brand-secondary aucctus-border-secondary flex h-4 w-4 items-center justify-center rounded-full border-2'
            >
              <FileText className='aucctus-stroke-brand-primary h-2 w-2' />
            </div>
          ))}
        </div>
        <span className='aucctus-text-xs-medium aucctus-text-secondary'>
          Sources
        </span>
      </button>
    );
  }

  return (
    <div className='flex flex-wrap items-center gap-1.5'>
      {sources.map((source, idx) => (
        <button
          key={idx}
          className='aucctus-border-secondary aucctus-bg-primary-hover flex h-5 cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors'
          onClick={(e) => {
            e.stopPropagation();
            onSourceClick?.(source);
          }}
        >
          <FileText className='aucctus-stroke-secondary h-3 w-3' />
          <span className='aucctus-text-secondary'>{source}</span>
          <Download className='aucctus-stroke-secondary ml-0.5 h-2.5 w-2.5' />
        </button>
      ))}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(false);
        }}
        className='aucctus-text-tertiary-hover ml-1 text-[10px] transition-colors'
      >
        Collapse
      </button>
    </div>
  );
};

export default SourceBadges;
