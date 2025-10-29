import React from 'react';
import { Icon } from '@components';
import { ConceptIdea } from '../types';
import ConceptCard from './ConceptCard';

interface ConceptSectionProps {
  title: string;
  description: string;
  ideas: ConceptIdea[];
  sectionKey: 'core' | 'adjacent' | 'disruptive';
  selectedConceptUuids: string[];
  hoveredCard: string | null;
  selectedIdeaTitle: string | null;
  onCardMouseEnter: (cardId: string) => void;
  onCardMouseLeave: () => void;
  onCardClick: (idea: ConceptIdea, section: string) => void;
  onCardSelect: (idea: ConceptIdea, e: React.MouseEvent) => void;
  onGenerateMore?: () => void;
  getCardId: (section: string, title: string) => string;
}

const ConceptSection: React.FC<ConceptSectionProps> = ({
  title,
  description,
  ideas,
  sectionKey,
  selectedConceptUuids,
  hoveredCard,
  selectedIdeaTitle,
  onCardMouseEnter,
  onCardMouseLeave,
  onCardClick,
  onCardSelect,
  onGenerateMore,
  getCardId,
}) => {
  const sectionStyles =
    sectionKey === 'disruptive'
      ? 'bg-white/5 hover:bg-white/10 border-white/20'
      : 'bg-white/5 hover:bg-white/10 border-white/20';

  return (
    <div
      className={`h-1/3 ${sectionKey !== 'disruptive' ? 'border-b border-white/20' : ''} relative py-3 pl-6 pr-3`}
    >
      <div className='mb-6 flex items-baseline gap-2'>
        <h2 className='aucctus-text-sm aucctus-text-white opacity-70'>
          {title}
        </h2>
        <div className='group relative'>
          <Icon
            variant='help-circle'
            className='aucctus-stroke-white cursor-help opacity-50 transition-colors hover:opacity-80'
            height={16}
            width={16}
          />
          <div className='aucctus-text-white aucctus-text-xs pointer-events-none absolute left-6 top-0 z-20 whitespace-nowrap rounded-lg bg-black/70 px-3 py-2 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100'>
            {description}
          </div>
        </div>
      </div>
      <div>
        <div className='scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth pb-3'>
          {ideas.map((idea, index) => {
            const cardId = getCardId(sectionKey, idea.title);
            const isSelected = selectedConceptUuids.includes(idea.uuid);
            return (
              <ConceptCard
                key={index}
                idea={idea}
                section={sectionKey}
                isSelected={isSelected}
                isHovered={hoveredCard === cardId}
                isActive={selectedIdeaTitle === idea.title}
                onMouseEnter={() => onCardMouseEnter(cardId)}
                onMouseLeave={onCardMouseLeave}
                onClick={() => onCardClick(idea, sectionKey)}
                onSelectToggle={(e) => onCardSelect(idea, e)}
              />
            );
          })}

          {onGenerateMore && (
            <div
              className={`h-[120px] w-[60px] ${sectionStyles} flex flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed backdrop-blur-sm transition-all duration-200`}
              onClick={onGenerateMore}
            >
              <Icon
                variant='plus'
                className='aucctus-stroke-white opacity-60'
                height={20}
                width={20}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConceptSection;
