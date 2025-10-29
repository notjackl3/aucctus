import React from 'react';
import { Icon } from '@components';
import { ConceptIdea } from '../types';

interface ConceptCardProps {
  idea: ConceptIdea;
  section: 'core' | 'adjacent' | 'disruptive';
  isSelected: boolean;
  isHovered: boolean;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onSelectToggle: (e: React.MouseEvent) => void;
}

const ConceptCard: React.FC<ConceptCardProps> = ({
  idea,
  isSelected,
  isHovered,
  isActive,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onSelectToggle,
}) => {
  return (
    <div
      className={`relative max-h-none w-[200px] flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-white/10 p-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/15 xl:h-[120px] 2xl:h-[160px] ${
        isActive ? 'border-2 border-white/40' : 'border-white/20'
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div
        className='absolute right-2 top-2 z-10 cursor-pointer'
        onClick={onSelectToggle}
      >
        {isSelected ? (
          <div className='aucctus-bg-success-solid flex h-5 w-5 items-center justify-center rounded-full'>
            <Icon
              variant='check'
              className='aucctus-stroke-white'
              height={12}
              width={12}
              strokeWidth={3}
            />
          </div>
        ) : isHovered || isSelected ? (
          <div className='h-5 w-5 rounded-full border-2 border-white/40'></div>
        ) : null}
      </div>

      <div className='flex flex-col gap-2'>
        <Icon
          variant={idea.icon as any}
          className='aucctus-stroke-white flex-shrink-0 opacity-80'
          height={28}
          width={28}
        />
        <h3 className='aucctus-text-white aucctus-text-md-bold line-clamp-2 break-words leading-tight 2xl:line-clamp-4'>
          {idea.title}
        </h3>
      </div>
    </div>
  );
};

export default ConceptCard;
