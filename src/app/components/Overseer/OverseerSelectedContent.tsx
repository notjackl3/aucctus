import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import React, { useState } from 'react';

interface OverseerSelectedContentProps {
  selectedText: string;
  expandedText: string;
}

/**
 * Collapsible section showing the selected/expanded text
 * Features a subtle background and smooth transitions
 */
const OverseerSelectedContent: React.FC<OverseerSelectedContentProps> = ({
  selectedText,
  expandedText,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Show expanded text if different from selected, otherwise show selected
  const displayText =
    expandedText && expandedText !== selectedText ? expandedText : selectedText;

  return (
    <div className='aucctus-bg-frosted-glass border-b border-white/10 bg-black/40 backdrop-blur-md transition-all duration-300'>
      {/* Header row - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex w-full items-center justify-between gap-2 px-5 py-2 text-left transition-colors hover:bg-white/5'
      >
        <div className='flex items-center gap-2'>
          <span className='aucctus-text-2xs-bold uppercase tracking-widest text-white/40'>
            Selected Content
          </span>
        </div>
        <Icon
          variant='chevrondown'
          width={12}
          height={12}
          className={cn(
            'shrink-0 stroke-white/40 transition-transform duration-300',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      {/* Collapsible content area */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-32' : 'max-h-0',
        )}
      >
        <div className='no-scrollbar max-h-32 overflow-y-auto px-5 pb-3'>
          <p className='aucctus-text-xs leading-relaxed text-white/70'>
            &quot;{displayText}&quot;
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverseerSelectedContent;
