/**
 * High Scoring Concepts Carousel
 *
 * Displays a horizontal carousel of top-scoring concepts with images,
 * scores, strategic pillars, and stage badges.
 * Clicking the score rail opens the Score Breakdown Sheet.
 * Uses concept overview data to display proper presigned image URLs.
 */

import images from '@assets/img';
import { ComponentCarousel } from '@components';
import { ComponentCarouselRef } from '@components/Carousel/ComponentCarousel';
import ScoreBreakdownSheet from '@components/Tables/ConceptBank/ScoreBreakdownSheet';
import { useConceptOverview } from '@hooks/query/concepts.hook';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ConceptStage, HighScoringConcept, STAGE_STYLES } from '../types';
import HighScoringConceptsCarouselSkeleton from './HighScoringConceptsCarouselSkeleton';
import { ArrowLeft, ArrowRight, BarChart3, Lightbulb, Zap } from 'lucide-react';

interface HighScoringConceptsCarouselProps {
  concepts: HighScoringConcept[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onConceptClick?: (conceptId: string) => void;
}

/**
 * Get score badge colors based on score value
 */
const getScoreRailStyle = (score: number): React.CSSProperties => {
  if (score >= 80) return { backgroundColor: 'hsla(153, 79%, 40%, 0.9)' }; // Green
  if (score >= 60) return { backgroundColor: 'hsla(45, 100%, 51%, 0.9)' }; // Yellow
  if (score >= 50) return { backgroundColor: 'hsla(24, 100%, 50%, 0.9)' }; // Orange
  return { backgroundColor: 'hsla(0, 84%, 60%, 0.9)' }; // Red
};

/**
 * Individual concept card component
 * Fetches concept overview to get proper presigned image URL
 */
const ConceptCard: React.FC<{
  concept: HighScoringConcept;
  onClick?: () => void;
  onScoreClick?: () => void;
}> = ({ concept, onClick, onScoreClick }) => {
  const stageStyle =
    STAGE_STYLES[concept.stage as ConceptStage] || STAGE_STYLES.Ideating;

  // Fetch concept overview to get the proper presigned image URL
  const { conceptOverview } = useConceptOverview(concept.uuid);

  // Get the image URL from overview (same logic as ExecutiveDashboard)
  const imageUrl =
    conceptOverview?.useCustomImage && conceptOverview?.customImageUrl
      ? conceptOverview.customImageUrl
      : conceptOverview?.conceptImageUrl;

  return (
    <div
      className='aucctus-bg-primary aucctus-border-secondary group flex h-[420px] cursor-pointer flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
      onClick={onClick}
    >
      {/* Image with Score Rail */}
      <div className='relative h-40 shrink-0 overflow-hidden'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={concept.title}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
          />
        ) : (
          <div
            className='flex h-full w-full items-center justify-center bg-cover bg-center'
            style={{
              backgroundImage: `url(${images.aiExplorationsBackground})`,
            }}
          >
            <Lightbulb size={48} className='stroke-white/70' />
          </div>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

        {/* Score Rail - Right Side (expands on hover, shows "Score Breakdown") */}
        <div
          className='group/score absolute right-0 top-0 flex h-full w-10 cursor-pointer items-center justify-center overflow-hidden backdrop-blur-sm transition-[width] duration-150 ease-out hover:w-20'
          style={getScoreRailStyle(concept.score)}
          onClick={(e) => {
            e.stopPropagation();
            onScoreClick?.();
          }}
        >
          <div className='flex flex-col items-center justify-center'>
            <span className='text-lg font-bold tabular-nums text-white'>
              {concept.score}
            </span>
            <span className='mt-1 h-0 overflow-hidden whitespace-nowrap text-center text-[10px] font-medium leading-tight text-white/90 opacity-0 transition-opacity duration-150 group-hover/score:h-auto group-hover/score:opacity-100'>
              Score
              <br />
              Breakdown
            </span>
          </div>
        </div>

        {/* Strategic Pillar */}
        <div className='absolute bottom-3 left-3'>
          <span
            className='rounded-full px-2 py-1 text-xs font-medium backdrop-blur-sm'
            style={{
              backgroundColor: `${concept.pillarColor}20`,
              color: 'white',
              border: `1px solid ${concept.pillarColor}40`,
            }}
          >
            {concept.strategicPillar}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className='flex min-h-0 flex-1 flex-col space-y-3 p-4'>
        <h3 className='aucctus-text-primary line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-primary-500'>
          {concept.title}
        </h3>
        <p className='aucctus-text-secondary aucctus-text-sm line-clamp-6 flex-1 leading-relaxed'>
          {conceptOverview?.whatIsThis || concept.description}
        </p>

        {/* Owner, Stage Badge */}
        <div className='mt-auto flex items-center gap-2'>
          <div className='aucctus-bg-secondary aucctus-text-secondary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium'>
            {concept.owner.initials}
          </div>
          <span className='aucctus-text-xs aucctus-text-secondary'>
            {concept.owner.name}
          </span>
          <span
            className={`aucctus-text-xs rounded border px-2 py-0.5 font-medium ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}
          >
            {concept.stage}
          </span>
        </div>
      </div>
    </div>
  );
};

const HighScoringConceptsCarousel: React.FC<
  HighScoringConceptsCarouselProps
> = ({ concepts, isLoading = false, onViewAll, onConceptClick }) => {
  const carouselRef = useRef<ComponentCarouselRef>(null);

  // State for the score breakdown sheet
  const [selectedConcept, setSelectedConcept] =
    useState<HighScoringConcept | null>(null);

  const handleScrollPrev = useCallback(() => {
    carouselRef.current?.scrollPrev();
  }, []);

  const handleScrollNext = useCallback(() => {
    carouselRef.current?.scrollNext();
  }, []);

  const handleScoreClick = useCallback((concept: HighScoringConcept) => {
    setSelectedConcept(concept);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedConcept(null);
  }, []);

  const sortedConcepts = useMemo(
    () => [...concepts].sort((a, b) => b.score - a.score),
    [concepts],
  );

  const hasData = concepts.length > 0;

  // Show skeleton while loading
  if (isLoading) {
    return <HighScoringConceptsCarouselSkeleton />;
  }

  return (
    <>
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border shadow-sm'>
        <div className='aucctus-bg-secondary/30 p-6'>
          {/* Header */}
          <div className='mb-6 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Zap size={20} className='aucctus-stroke-tertiary' />
              <h2 className='aucctus-text-primary aucctus-text-xl font-semibold'>
                High Scoring Concepts
              </h2>
            </div>
            {hasData && (
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1'>
                  <button
                    onClick={handleScrollPrev}
                    className='aucctus-bg-primary aucctus-border-secondary hover:aucctus-bg-secondary flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-colors'
                    aria-label='Previous'
                  >
                    <ArrowLeft size={16} className='aucctus-stroke-secondary' />
                  </button>
                  <button
                    onClick={handleScrollNext}
                    className='aucctus-bg-primary aucctus-border-secondary hover:aucctus-bg-secondary flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-colors'
                    aria-label='Next'
                  >
                    <ArrowRight
                      size={16}
                      className='aucctus-stroke-secondary'
                    />
                  </button>
                </div>
                {onViewAll && (
                  <button
                    onClick={onViewAll}
                    className='aucctus-text-secondary hover:aucctus-text-primary flex items-center gap-1 text-sm transition-colors'
                  >
                    View All
                    <ArrowRight
                      size={16}
                      className='aucctus-stroke-secondary'
                    />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Carousel Content or Empty State */}
          {hasData ? (
            <div className='relative'>
              <ComponentCarousel
                ref={carouselRef}
                showNavigation={false}
                gap='16px'
                cardWidth='340px'
              >
                {sortedConcepts.map((concept) => (
                  <ConceptCard
                    key={concept.id}
                    concept={concept}
                    onClick={() => onConceptClick?.(concept.id)}
                    onScoreClick={() => handleScoreClick(concept)}
                  />
                ))}
              </ComponentCarousel>
              {/* Fade overlay on right edge */}
              <div className='aucctus-bg-primary pointer-events-none absolute bottom-0 right-0 top-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-gray-900' />
            </div>
          ) : (
            <div className='flex h-[200px] flex-col items-center justify-center text-center'>
              <BarChart3
                size={48}
                className='aucctus-stroke-tertiary mb-4 opacity-50'
              />
              <p className='aucctus-text-secondary aucctus-text-md mb-1'>
                No priority scores calculated yet
              </p>
              <p className='aucctus-text-tertiary aucctus-text-sm'>
                Calculate priorities to see your highest-scoring concepts here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Score Breakdown Sheet */}
      <ScoreBreakdownSheet
        isOpen={!!selectedConcept}
        onClose={handleCloseSheet}
        conceptTitle={selectedConcept?.title || ''}
        conceptDescription={selectedConcept?.description}
        conceptUuid={selectedConcept?.uuid}
        score={selectedConcept?.score}
      />
    </>
  );
};

export default React.memo(HighScoringConceptsCarousel);
