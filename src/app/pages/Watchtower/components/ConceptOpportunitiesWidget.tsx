import images from '@assets/img';
import {
  useAddOpportunityToConceptBank,
  useWatchtowerOpportunities,
} from '@hooks/query/watchtower.hook';
import { useWatchtowerView } from '../WatchtowerViewContext';
import { DynamicIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import {
  ArrowRight,
  Check,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

const urgencyConfig = {
  immediate: {
    label: 'Act Now',
    bgClass: 'bg-red-500/15 text-red-600 border-red-500/25',
    iconVariant: 'trendup' as const,
  },
  strategic: {
    label: '6-18 mo',
    bgClass: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
    iconVariant: 'clock' as const,
  },
  exploratory: {
    label: 'Explore',
    bgClass: 'bg-blue-500/15 text-blue-600 border-blue-500/25',
    iconVariant: 'trending-up' as const,
  },
};

/**
 * ConceptOpportunitiesWidget - Signal-driven concept suggestions
 */
const ConceptOpportunitiesWidget: React.FC = () => {
  const { activeWatchtowerConfigUuid, selectedScanUuid } = useWatchtowerView();
  const { opportunities, isLoading } = useWatchtowerOpportunities(
    selectedScanUuid,
    activeWatchtowerConfigUuid,
  );
  const { addToBank, addingOpportunityId } = useAddOpportunityToConceptBank();

  // Track opportunities added during this session for optimistic UI updates
  // (supplements the backend isAddedToBank field for immediate feedback)
  const [sessionAddedIds, setSessionAddedIds] = useState<Set<string>>(
    new Set(),
  );

  const handleAddToBank = useCallback(
    (opportunityId: string) => {
      addToBank(opportunityId, {
        onSuccess: () => {
          // Mark this opportunity as added for optimistic UI
          setSessionAddedIds((prev) => new Set([...prev, opportunityId]));
        },
      });
    },
    [addToBank],
  );

  if (isLoading || opportunities.length === 0) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary flex h-[490px] flex-col items-center justify-center rounded-xl border p-6'>
        <Lightbulb size={32} className='aucctus-stroke-tertiary mb-2' />
        <p className='aucctus-text-tertiary text-sm'>
          {isLoading
            ? 'Loading opportunities...'
            : 'No concept opportunities available'}
        </p>
      </div>
    );
  }

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-[490px] flex-col rounded-xl border p-6'>
      <div className='mb-4 flex items-center gap-2'>
        <Lightbulb size={20} className='aucctus-stroke-secondary' />
        <h3 className='aucctus-text-primary aucctus-text-lg-semibold'>
          Concept Opportunities
        </h3>
        <span className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-tertiary flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]'>
          <Sparkles size={12} className='aucctus-stroke-tertiary' />
          Signal-Driven
        </span>
      </div>
      <p className='aucctus-text-secondary aucctus-text-sm mb-4'>
        Specific product concepts suggested based on active signals
      </p>

      <div className='scrollbar-thin scrollbar-thumb-muted flex min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden pb-2'>
        {opportunities.map((concept) => {
          const urgency = urgencyConfig[concept.urgency];

          return (
            <div
              key={concept.id}
              className='aucctus-bg-primary aucctus-border-secondary group flex h-full max-h-[400px] w-[300px] flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-lg border transition-all hover:shadow-lg'
            >
              {/* Image Header */}
              <div className='relative h-28 flex-shrink-0 overflow-hidden'>
                {concept.image ? (
                  <img
                    src={concept.image}
                    alt={concept.title}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                ) : (
                  <div
                    className='flex h-full w-full items-center justify-center bg-cover bg-center'
                    style={{
                      backgroundImage: `url(${images.nucleusBrandGradient})`,
                    }}
                  >
                    <div className='flex flex-col items-center gap-1'>
                      <RefreshCw
                        size={20}
                        className='animate-spin stroke-white/70'
                      />
                      <span className='text-[10px] font-medium text-white/70'>
                        Generating image...
                      </span>
                    </div>
                  </div>
                )}
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent' />
                <span
                  className={cn(
                    'absolute right-2 top-2 flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]',
                    urgency.bgClass,
                  )}
                >
                  <DynamicIcon
                    variant={urgency.iconVariant}
                    height={12}
                    width={12}
                    className='stroke-current'
                  />
                  {urgency.label}
                </span>
              </div>

              <div className='flex min-h-0 flex-1 flex-col p-3'>
                <h4 className='aucctus-text-primary aucctus-text-sm-semibold line-clamp-2 leading-snug transition-colors group-hover:text-opacity-80'>
                  {concept.title}
                </h4>

                <div className='scrollbar-thin no-scrollbar mt-2 min-h-0 flex-1 overflow-y-auto'>
                  <p className='aucctus-text-secondary text-xs leading-relaxed'>
                    {concept.description}
                  </p>
                </div>

                <div className='aucctus-border-secondary mt-2 flex-shrink-0 space-y-1.5 border-t pt-2'>
                  <div className='flex items-center gap-1.5'>
                    <span className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-tertiary rounded border px-1.5 py-0.5 text-[10px]'>
                      {concept.signalBasis}
                    </span>
                  </div>
                  <p className='aucctus-text-success-primary text-[11px] font-medium'>
                    {concept.potentialImpact}
                  </p>
                </div>

                {(() => {
                  const isThisAdding = addingOpportunityId === concept.id;
                  // Check both backend state and session-local state for optimistic updates
                  const isAlreadyAdded =
                    concept.isAddedToBank || sessionAddedIds.has(concept.id);
                  const isDisabled = isThisAdding || isAlreadyAdded;

                  return (
                    <button
                      onClick={() => handleAddToBank(concept.id)}
                      disabled={isDisabled}
                      className={cn(
                        'mt-auto flex w-full flex-shrink-0 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors',
                        isAlreadyAdded
                          ? 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                          : 'border border-gray-900 bg-gray-900 text-white hover:bg-gray-800 dark:border-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100',
                        isThisAdding && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      {isThisAdding ? (
                        <>
                          <RefreshCw
                            size={12}
                            className='animate-spin stroke-current'
                          />
                          Adding...
                        </>
                      ) : isAlreadyAdded ? (
                        <>
                          <Check size={12} className='stroke-current' />
                          Added to Concept Bank
                        </>
                      ) : (
                        <>
                          Add to Concept Bank
                          <ArrowRight size={12} className='stroke-current' />
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(ConceptOpportunitiesWidget);
