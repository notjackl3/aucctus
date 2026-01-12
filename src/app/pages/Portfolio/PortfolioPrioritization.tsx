/**
 * Portfolio Prioritization Page
 *
 * Displays a 2x2 matrix plot of concepts based on:
 * - X-axis: Financial Opportunity Score (0-100)
 * - Y-axis: Innovation Risk Score (inverted, so low risk = top)
 *
 * Concepts in the top-right quadrant (high opportunity, low risk) are highest priority.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Badge,
  ComponentCarousel,
  ComponentTooltip,
  Header,
  Icon,
  Card,
} from '@components';
import { ComponentCarouselRef } from '@components/Carousel/ComponentCarousel';
import {
  PortfolioSummary,
  useBulkPrioritySocketEvents,
  useConceptPriorities,
  useConceptPriority,
  useGenerateBulkConceptPriorities,
  usePrioritySocketEvents,
} from '@hooks/query/concept-priority.hook';
import { useConcepts } from '@hooks/query/concepts.hook';
import { AppPath } from '@routes/routes';
import { useNavigate } from 'react-router-dom';
import { IConcept } from '@libs/api/types';

import PriorityMatrix from './components/PriorityMatrix';
import ConceptDetailPanel from './components/ConceptDetailPanel';
import QuadrantLegend from './components/QuadrantLegend';
import PriorityStats from './components/PriorityStats';

export interface PrioritizedConcept {
  uuid: string;
  conceptUuid: string;
  identifier: string;
  title: string;
  strategicAlignmentScore: number;
  financialOpportunityScore: number;
  innovationRiskScore: number;
  overallPriorityScore: number;
  updatedAt: string;
  // Reasoning fields (loaded when concept is selected)
  strategicAlignmentReasoning?: string;
  financialOpportunityReasoning?: string;
  innovationRiskReasoning?: string;
}

/**
 * Executive Summary Carousel Component
 * Displays AI-generated insights in a scrollable carousel following the ExecutiveSummaryBanner pattern
 */
interface PortfolioExecutiveSummaryCarouselProps {
  portfolioSummary: PortfolioSummary;
}

const PortfolioExecutiveSummaryCarousel: React.FC<
  PortfolioExecutiveSummaryCarouselProps
> = ({ portfolioSummary }) => {
  const carouselRef = useRef<ComponentCarouselRef>(null);
  const carouselContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Build slides array
  const slides = useMemo(() => {
    const slideList: Array<{
      type: 'overview' | 'recommendation' | 'priority';
      title: string;
      content: string;
      rank?: number;
      score?: number;
    }> = [
      {
        type: 'overview',
        title: 'Portfolio Overview',
        content: portfolioSummary.executiveInsight,
      },
      {
        type: 'recommendation',
        title: 'Recommended Action',
        content: portfolioSummary.keyRecommendation,
      },
      ...portfolioSummary.topPriorities.map((priority, index) => ({
        type: 'priority' as const,
        title: priority.title,
        content: priority.keyStrength,
        rank: index + 1,
        score: priority.overallScore,
      })),
    ];
    return slideList;
  }, [portfolioSummary]);

  const scrollPrev = useCallback(() => {
    setCurrentSlide((prev) => {
      const newIndex = prev > 0 ? prev - 1 : slides.length - 1;

      // If looping from start to end, manually scroll to last slide
      if (prev === 0 && newIndex === slides.length - 1) {
        // Find the carousel container and scroll to the last card
        setTimeout(() => {
          if (carouselContainerRef.current) {
            const container = carouselContainerRef.current;
            const cards = Array.from(
              container.querySelectorAll('[data-carousel-card]'),
            ) as HTMLElement[];
            if (cards.length > 0) {
              const lastCard = cards[cards.length - 1];
              container.scrollTo({
                left: lastCard.offsetLeft,
                behavior: 'smooth',
              });
            }
          }
        }, 50);
      } else {
        carouselRef.current?.scrollPrev();
      }

      return newIndex;
    });
  }, [slides.length]);

  const scrollNext = useCallback(() => {
    setCurrentSlide((prev) => {
      const newIndex = prev < slides.length - 1 ? prev + 1 : 0;

      // If looping from end to start, manually scroll to first slide
      if (prev === slides.length - 1 && newIndex === 0) {
        setTimeout(() => {
          if (carouselContainerRef.current) {
            carouselContainerRef.current.scrollTo({
              left: 0,
              behavior: 'smooth',
            });
          }
        }, 50);
      } else {
        carouselRef.current?.scrollNext();
      }

      return newIndex;
    });
  }, [slides.length]);

  const scrollToSlide = useCallback((index: number) => {
    setCurrentSlide((prevSlide) => {
      // ComponentCarousel doesn't have a scrollTo method, so we'll need to navigate manually
      const diff = index - prevSlide;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          carouselRef.current?.scrollNext();
        }
      } else if (diff < 0) {
        for (let i = 0; i < Math.abs(diff); i++) {
          carouselRef.current?.scrollPrev();
        }
      }
      return index;
    });
  }, []);

  // Find the carousel container after render
  useEffect(() => {
    const findCarouselContainer = () => {
      if (!carouselContainerRef.current) {
        // Look for the scrollable container with data-carousel-card children
        const container = document.querySelector('[data-carousel-card]')
          ?.parentElement as HTMLDivElement;
        if (container && container.classList.contains('scrollbar-hide')) {
          carouselContainerRef.current = container;
        }
      }
    };

    // Try immediately and also after a short delay to ensure DOM is ready
    findCarouselContainer();
    const timeoutId = setTimeout(findCarouselContainer, 100);
    return () => clearTimeout(timeoutId);
  }, [slides]);

  return (
    <div className='animate-in fade-in slide-in-from-top-2 w-full duration-300'>
      {/* Executive Summary Banner - matching existing pattern */}
      <div className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'>
        {/* Header with navigation */}
        <div className='flex items-center justify-between px-6 pb-3 pt-5'>
          <div className='flex items-center gap-3'>
            <Icon
              variant='lightbulb'
              className='aucctus-stroke-tertiary flex-shrink-0'
              height={20}
              width={20}
            />
            <h3 className='aucctus-text-tertiary aucctus-text-sm font-medium uppercase tracking-wider'>
              EXECUTIVE SUMMARY
            </h3>
            <Badge.Beta size='xs' />
          </div>
          <div className='flex items-center gap-3'>
            {/* Previous arrow */}
            <button
              onClick={scrollPrev}
              className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full transition-colors'
              aria-label='Previous slide'
            >
              <Icon
                variant='arrowleft'
                height={14}
                width={14}
                className='aucctus-stroke-secondary'
              />
            </button>

            {/* Dot indicators */}
            <div className='flex items-center gap-1.5'>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-4 bg-primary-500'
                      : 'w-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Next arrow */}
            <button
              onClick={scrollNext}
              className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full transition-colors'
              aria-label='Next slide'
            >
              <Icon
                variant='arrowright'
                height={14}
                width={14}
                className='aucctus-stroke-secondary'
              />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className='px-6 pb-5'>
          <ComponentCarousel
            ref={carouselRef}
            showNavigation={false}
            gap='24px'
          >
            {slides.map((slide, index) => (
              <div key={index} className='min-h-[80px]'>
                {slide.type === 'overview' ? (
                  <div>
                    <p className='aucctus-text-primary aucctus-text-xl-semibold leading-relaxed'>
                      {slide.content}
                    </p>
                    <div className='mt-3 flex items-center gap-4'>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          portfolioSummary.portfolioHealth === 'strong'
                            ? 'aucctus-bg-success-subtle aucctus-text-success-primary'
                            : portfolioSummary.portfolioHealth === 'balanced'
                              ? 'aucctus-bg-warning-subtle aucctus-text-warning-primary'
                              : 'aucctus-bg-error-subtle aucctus-text-error-primary'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            portfolioSummary.portfolioHealth === 'strong'
                              ? 'aucctus-bg-success-solid'
                              : portfolioSummary.portfolioHealth === 'balanced'
                                ? 'aucctus-bg-warning-solid'
                                : 'aucctus-bg-error-solid'
                          }`}
                        />
                        {portfolioSummary.portfolioHealth === 'strong'
                          ? 'Strong Portfolio'
                          : portfolioSummary.portfolioHealth === 'balanced'
                            ? 'Balanced Portfolio'
                            : 'Needs Attention'}
                      </span>
                    </div>
                  </div>
                ) : slide.type === 'recommendation' ? (
                  <div className='flex items-start gap-4'>
                    <div className='aucctus-bg-success-subtle flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                      <Icon
                        variant='lightbulb'
                        height={20}
                        width={20}
                        className='aucctus-stroke-success-primary'
                      />
                    </div>
                    <div className='flex-1'>
                      <h4 className='aucctus-text-sm-semibold aucctus-text-success-primary mb-1'>
                        {slide.title}
                      </h4>
                      <p className='aucctus-text-primary aucctus-text-lg leading-relaxed'>
                        {slide.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='flex items-start gap-4'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white'>
                      #{slide.rank}
                    </div>
                    <div className='flex-1'>
                      <div className='mb-1 flex items-center gap-3'>
                        <h4 className='aucctus-text-lg-semibold aucctus-text-primary'>
                          {slide.title}
                        </h4>
                        <span
                          className={`aucctus-text-lg-bold ${
                            (slide.score ?? 0) >= 70
                              ? 'aucctus-text-success-primary'
                              : (slide.score ?? 0) >= 50
                                ? 'aucctus-text-warning-primary'
                                : 'aucctus-text-error-primary'
                          }`}
                        >
                          {slide.score}
                        </span>
                      </div>
                      <p className='aucctus-text-md aucctus-text-secondary'>
                        {slide.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </ComponentCarousel>
        </div>
      </div>
    </div>
  );
};

const PortfolioPrioritization: React.FC = () => {
  const navigate = useNavigate();
  const [selectedConceptUuid, setSelectedConceptUuid] = useState<string | null>(
    null,
  );

  // Subscribe to single priority completion events
  usePrioritySocketEvents();

  // Subscribe to bulk priority progress events and portfolio summary
  const { progress: bulkProgress, portfolioSummary } =
    useBulkPrioritySocketEvents();

  // Mutation for bulk priority generation
  const { mutate: generateBulkPriorities, isLoading: isStartingBulk } =
    useGenerateBulkConceptPriorities();

  // Fetch all concept priorities
  const { priorities, isLoading: isPrioritiesLoading } = useConceptPriorities();

  // Fetch all concepts (excluding archived) for prioritization
  // The "Complete" section in UI includes both "draft" and "active" backend categories
  const { data: conceptsData, isLoading: isConceptsLoading } = useConcepts({});

  // All non-archived concepts are eligible for priority calculation
  const allConcepts = useMemo(
    () => conceptsData?.results ?? [],
    [conceptsData],
  );

  const isBulkCalculating = bulkProgress.isCalculating || isStartingBulk;

  // Fetch full priority details (including reasoning) for selected concept
  const {
    priority: selectedPriorityDetails,
    isLoading: isPriorityDetailsLoading,
  } = useConceptPriority(selectedConceptUuid ?? '');

  // Combine priorities with concept data
  const prioritizedConcepts = useMemo<PrioritizedConcept[]>(() => {
    if (!priorities || allConcepts.length === 0) return [];

    // Create a map for efficient concept lookup
    const conceptMap = new Map<string, IConcept>();
    allConcepts.forEach((c) => conceptMap.set(c.uuid, c));

    return priorities
      .map((priority) => {
        const concept = conceptMap.get(priority.conceptUuid);
        if (!concept) return null;

        return {
          uuid: priority.uuid,
          conceptUuid: priority.conceptUuid,
          identifier: concept.identifier,
          title: concept.title,
          strategicAlignmentScore: priority.strategicAlignmentScore,
          financialOpportunityScore: priority.financialOpportunityScore,
          innovationRiskScore: priority.innovationRiskScore,
          overallPriorityScore: priority.overallPriorityScore,
          updatedAt: priority.updatedAt,
        };
      })
      .filter((c): c is PrioritizedConcept => c !== null);
  }, [priorities, allConcepts]);

  // Get selected concept details with reasoning
  const selectedConcept = useMemo((): PrioritizedConcept | null => {
    if (!selectedConceptUuid) return null;
    const baseConcept = prioritizedConcepts.find(
      (c) => c.conceptUuid === selectedConceptUuid,
    );
    if (!baseConcept) return null;

    // Merge reasoning from full priority details if available
    if (selectedPriorityDetails) {
      return {
        ...baseConcept,
        strategicAlignmentReasoning:
          selectedPriorityDetails.strategicAlignmentReasoning,
        financialOpportunityReasoning:
          selectedPriorityDetails.financialOpportunityReasoning,
        innovationRiskReasoning:
          selectedPriorityDetails.innovationRiskReasoning,
      };
    }

    return baseConcept;
  }, [selectedConceptUuid, prioritizedConcepts, selectedPriorityDetails]);

  const isLoading = isPrioritiesLoading || isConceptsLoading;

  const handleConceptClick = (conceptUuid: string) => {
    setSelectedConceptUuid(
      selectedConceptUuid === conceptUuid ? null : conceptUuid,
    );
  };

  const handleViewConcept = (identifier: string) => {
    navigate(`/concept/${identifier}`);
  };

  return (
    <div className='box-border flex h-full flex-col gap-6 overflow-auto p-6 lg:p-8'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='target'
                height={28}
                width={28}
                className='aucctus-stroke-brand-primary'
              />
              <Header.One text='Portfolio Prioritization' />
            </div>
            <ComponentTooltip
              tip={
                <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border px-3 py-2 shadow-lg'>
                  <p className='aucctus-text-primary aucctus-text-xs max-w-[200px]'>
                    This is an early feature and may make mistakes.
                  </p>
                </div>
              }
            >
              <Badge.Beta size='sm' />
            </ComponentTooltip>
          </div>
          <p className='aucctus-text-md aucctus-text-secondary mt-1'>
            Visualize and prioritize your concept portfolio based on{' '}
            <span className='aucctus-text-brand-primary font-semibold'>
              financial opportunity
            </span>{' '}
            and{' '}
            <span className='aucctus-text-brand-primary font-semibold'>
              innovation risk
            </span>
            .
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          {/* Calculate All Button - Brand colored */}
          <button
            className='aucctus-bg-brand-solid hover:aucctus-bg-brand-solid-hover flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => {
              // Pass all concept UUIDs to mark them as calculating
              const conceptUuids = allConcepts.map((c) => c.uuid);
              generateBulkPriorities(conceptUuids);
            }}
            disabled={isBulkCalculating || allConcepts.length === 0}
          >
            {isBulkCalculating ? (
              <>
                <Icon
                  variant='refresh'
                  height={16}
                  width={16}
                  className='animate-spin stroke-white'
                />
                {bulkProgress.total > 0
                  ? `Calculating ${bulkProgress.current}/${bulkProgress.total}...`
                  : 'Starting...'}
              </>
            ) : (
              <>
                <Icon
                  variant='zap'
                  height={16}
                  width={16}
                  className='stroke-white'
                />
                Calculate All ({allConcepts.length})
              </>
            )}
          </button>
          <button
            className='btn btn-light shrink-0'
            onClick={() => navigate(AppPath.ConceptBank)}
          >
            <Icon
              variant='arrowleft'
              height={16}
              width={16}
              className='aucctus-stroke-secondary'
            />
            Back to Concepts
          </button>
        </div>
      </div>

      {/* Bulk Progress Bar */}
      {isBulkCalculating && bulkProgress.total > 0 && (
        <div className='aucctus-bg-brand-primary-alt aucctus-border-brand-subtle rounded-lg border p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='refresh'
                height={16}
                width={16}
                className='aucctus-stroke-brand-primary animate-spin'
              />
              <span className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                Calculating priorities...
              </span>
            </div>
            <span className='aucctus-text-sm aucctus-text-brand-tertiary'>
              {bulkProgress.successCount} completed, {bulkProgress.errorCount}{' '}
              errors
            </span>
          </div>
          <div className='aucctus-bg-tertiary h-2 w-full overflow-hidden rounded-full'>
            <div
              className='aucctus-bg-brand-solid h-full rounded-full transition-all duration-300'
              style={{
                width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
              }}
            />
          </div>
          {bulkProgress.currentConceptTitle && (
            <p className='aucctus-text-xs aucctus-text-brand-tertiary mt-2'>
              Processing: {bulkProgress.currentConceptTitle}
            </p>
          )}
        </div>
      )}

      {/* AI Executive Summary Carousel */}
      {portfolioSummary?.showSummary && (
        <PortfolioExecutiveSummaryCarousel
          portfolioSummary={portfolioSummary}
        />
      )}

      {/* Stats Row */}
      <PriorityStats concepts={prioritizedConcepts} isLoading={isLoading} />

      {/* Main Content - Matrix and Concepts List */}
      <div className='grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]'>
        {/* Left Panel - Priority Matrix */}
        <Card.Detail
          title='Priority Matrix'
          subtitle='Click a concept to explore'
          cardClassName='w-full h-full min-h-[500px] flex flex-col'
          contentClassName='p-4 lg:p-6 flex-1 min-h-0'
          headerAction={<QuadrantLegend />}
        >
          {isLoading ? (
            <div className='flex h-96 items-center justify-center'>
              <div className='aucctus-text-secondary flex flex-col items-center gap-3'>
                <Icon
                  variant='refresh'
                  height={32}
                  width={32}
                  className='aucctus-stroke-tertiary animate-spin'
                />
                <span className='aucctus-text-sm'>Loading priorities...</span>
              </div>
            </div>
          ) : prioritizedConcepts.length === 0 ? (
            <div className='flex h-96 flex-col items-center justify-center gap-4'>
              <div className='aucctus-bg-brand-primary-alt flex h-24 w-24 items-center justify-center rounded-full'>
                <Icon
                  variant='target'
                  height={48}
                  width={48}
                  className='aucctus-stroke-brand-primary'
                />
              </div>
              <div className='text-center'>
                <h3 className='aucctus-text-md-semibold aucctus-text-primary mb-2'>
                  No Prioritized Concepts
                </h3>
                <p className='aucctus-text-sm aucctus-text-secondary mb-4 max-w-md'>
                  Calculate priorities for your concepts in the Concept Bank to
                  see them visualized here.
                </p>
                <button
                  className='aucctus-bg-brand-solid hover:aucctus-bg-brand-solid-hover rounded-lg px-4 py-2 font-semibold text-white transition-colors'
                  onClick={() => navigate(AppPath.ConceptBank)}
                >
                  Go to Concept Bank
                </button>
              </div>
            </div>
          ) : (
            <PriorityMatrix
              concepts={prioritizedConcepts}
              selectedConceptUuid={selectedConceptUuid}
              onConceptClick={handleConceptClick}
            />
          )}
        </Card.Detail>

        {/* Right Panel - Concept Details or All Concepts List */}
        <div className='min-h-[400px]'>
          <ConceptDetailPanel
            concept={selectedConcept}
            allConcepts={prioritizedConcepts}
            onConceptSelect={handleConceptClick}
            onViewConcept={handleViewConcept}
            onClose={() => setSelectedConceptUuid(null)}
            isLoadingDetails={isPriorityDetailsLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default PortfolioPrioritization;
