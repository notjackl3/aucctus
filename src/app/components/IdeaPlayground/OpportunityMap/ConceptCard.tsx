import React from 'react';
import type { IGeneratedIdeaPlaygroundConcept } from '../types';
import { Check, Loader2, X } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface ConceptCardProps {
  concept: IGeneratedIdeaPlaygroundConcept;
  isSelected: boolean;
  isActive: boolean;
  isDeleting?: boolean;
  isNew?: boolean;
  onCardClick: () => void;
  onCardSelect: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  animationDelay?: number;
}

/**
 * Grid Card Component for 2x2 OpportunityMap Layout
 * Displays concept card with:
 * - Selection checkbox
 * - Category badge (Core/Adjacent/Disruptive)
 * - Icon, title, description
 * - Score placeholder (3 bars)
 */
const ConceptCard: React.FC<ConceptCardProps> = ({
  concept,
  isSelected,
  isActive,
  isDeleting = false,
  isNew = false,
  onCardClick,
  onCardSelect,
  onDelete,
  animationDelay = 0,
}) => {
  // Determine category badge styling
  const getBadgeStyle = () => {
    switch (concept.conceptType) {
      case 'Core':
        return 'border border-blue-400/30 bg-blue-500/20 text-blue-300';
      case 'Adjacent':
        return 'border border-purple-400/30 bg-purple-500/20 text-purple-300';
      case 'Disruptive':
        return 'border border-orange-400/30 bg-orange-500/20 text-orange-300';
      default:
        return 'border border-white/20 bg-white/10 text-white/70';
    }
  };

  /** Icon variant from backend - assigned by AI based on concept's domain/mechanism */
  const iconVariant: string = concept.icon || 'lightbulb';

  return (
    <div
      onClick={onCardClick}
      className={`group relative flex h-[220px] cursor-pointer flex-col rounded-lg border p-4 transition-all duration-200 ${
        isActive
          ? 'border-white/60 bg-white/20 shadow-lg'
          : 'border-white/30 bg-white/10 hover:border-white/40 hover:bg-white/15'
      }`}
      style={{
        animation: `fadeIn 0.6s ease-out ${animationDelay}s both`,
      }}
    >
      {/* Top-right action buttons */}
      <div className='absolute right-3 top-3 z-10 flex items-center gap-2'>
        {/* NEW badge */}
        {isNew && (
          <span className='flex items-center gap-1 text-[10px] font-medium text-white'>
            <span className='h-1.5 w-1.5 rounded-full bg-white'></span>
            NEW
          </span>
        )}

        {/* Delete button - appears on hover */}
        <button
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
            isDeleting
              ? 'border-red-500/50 bg-red-500/20'
              : 'border-white/30 bg-white/10 opacity-0 hover:border-red-400/50 hover:bg-red-500/20 group-hover:opacity-100'
          }`}
          onClick={(e) => onDelete(e)}
          disabled={isDeleting}
          aria-label='Delete concept'
        >
          {isDeleting ? (
            <Loader2 className='aucctus-stroke-white h-3 w-3 animate-spin' />
          ) : (
            <X size={10} className='aucctus-stroke-white' />
          )}
        </button>

        {/* Selection checkbox */}
        <div onClick={(e) => onCardSelect(e)}>
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
              isSelected
                ? 'aucctus-bg-success-solid border-green-500'
                : 'border-white/50 hover:border-white/70'
            }`}
          >
            {isSelected && <Check size={12} className='aucctus-stroke-white' />}
          </div>
        </div>
      </div>

      {/* Category Badge */}
      <div className='absolute left-3 top-3'>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getBadgeStyle()}`}
        >
          {concept.conceptType}
        </span>
      </div>

      {/* Content */}
      <div className='flex h-full flex-col pt-8'>
        <div className='mb-2 flex items-start gap-2 pr-8'>
          <DynamicIcon
            variant={iconVariant}
            className='aucctus-stroke-white mt-0.5 h-6 w-6 flex-shrink-0'
          />
          <h3 className='aucctus-text-sm-bold aucctus-text-white leading-tight'>
            {concept.title}
          </h3>
        </div>

        <p className='aucctus-text-xs aucctus-text-white mb-4 line-clamp-3 flex-1 leading-relaxed opacity-70'>
          {concept.description}
        </p>

        {/* Idea Score */}
        <div className='flex-start flex items-center gap-2 border-t border-white/20 pt-3'>
          <div className='flex items-center gap-2'>
            <span className='aucctus-text-xs aucctus-text-white opacity-70'>
              Idea Score
            </span>
            <div className='flex gap-1'>
              {[1, 2, 3].map((bar) => {
                const score = concept.momentumScore
                  ? parseInt(concept.momentumScore, 10)
                  : 0;
                return (
                  <div
                    key={bar}
                    className={`h-4 w-1 rounded-full ${
                      bar <= score
                        ? score === 3
                          ? 'bg-green-400'
                          : score === 2
                            ? 'bg-yellow-400'
                            : 'bg-orange-400'
                        : 'bg-white/20'
                    }`}
                  ></div>
                );
              })}
            </div>
          </div>

          {/* Momentum Label */}
          {concept.momentumScore && (
            <span
              className={`aucctus-text-xs font-semibold ${
                concept.momentumScore === '3'
                  ? 'text-green-400'
                  : concept.momentumScore === '2'
                    ? 'text-yellow-400'
                    : 'text-orange-400'
              }`}
            >
              {concept.momentumScore === '3'
                ? 'High Momentum'
                : concept.momentumScore === '2'
                  ? 'Emerging Momentum'
                  : 'Early Momentum'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConceptCard;
