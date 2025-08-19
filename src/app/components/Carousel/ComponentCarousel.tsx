import React, { useRef, useEffect, useState, useCallback } from 'react';
import Icon from '../Icon';

interface ComponentCarouselProps {
  children: React.ReactNode;
  cardWidth?: string;
  gap?: string;
  showNavigation?: boolean;
  autoScrollToCenter?: boolean;
  centerIndex?: number;
  className?: string;
  arrowPlacement?: 'top' | 'bottom';
}

// Component styles
const carouselStyles = 'scrollbar-hide flex w-full overflow-x-auto';
const navButtonStyles =
  'aucctus-bg-secondary-hover flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:aucctus-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed';
const navContainerStyles = 'flex justify-end gap-2';

const ComponentCarousel: React.FC<ComponentCarouselProps> = ({
  children,
  cardWidth,
  gap = '16px',
  showNavigation = true,
  autoScrollToCenter = false,
  centerIndex = -1,
  className = '',
  arrowPlacement = 'bottom',
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    scrollLeft: 0,
    maxScroll: 0,
    containerWidth: 0,
    canScrollLeft: false,
    canScrollRight: false,
  });

  // Update scroll state and button states
  const updateScrollState = useCallback(() => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const scrollLeft = Math.round(container.scrollLeft);
    const containerWidth = container.clientWidth;
    const scrollWidth = container.scrollWidth;
    const maxScroll = Math.max(0, scrollWidth - containerWidth);

    // Simple threshold check - at start/end with small tolerance
    const canScrollLeft = scrollLeft > 1;
    const canScrollRight = scrollLeft < maxScroll - 1;

    setScrollState({
      scrollLeft,
      maxScroll,
      containerWidth,
      canScrollLeft,
      canScrollRight,
    });
  }, []);

  // Debounced resize handler
  const handleResize = useCallback(() => {
    // Add small delay to allow DOM to settle after resize
    setTimeout(() => {
      updateScrollState();
    }, 50);
  }, [updateScrollState]);

  // Set up resize listener
  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollState, handleResize]);

  // Update scroll state when children change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateScrollState();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [children, updateScrollState]);

  // Auto-scroll to center functionality
  useEffect(() => {
    if (carouselRef.current && autoScrollToCenter && centerIndex >= 0) {
      const timeoutId = setTimeout(() => {
        if (carouselRef.current) {
          const carousel = carouselRef.current;
          const cards = Array.from(
            carousel.querySelectorAll('[data-carousel-card]'),
          ) as HTMLElement[];

          if (cards.length > 0 && centerIndex < cards.length) {
            const targetCard = cards[centerIndex];
            const containerWidth = carousel.clientWidth;
            const cardWidth = targetCard.offsetWidth;
            const targetPosition = targetCard.offsetLeft;

            const newScrollPosition =
              targetPosition - containerWidth / 2 + cardWidth / 2;

            carousel.scrollTo({
              left: Math.max(0, newScrollPosition),
              behavior: 'smooth',
            });
          }
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [centerIndex, autoScrollToCenter]);

  // Scroll event handler with debouncing
  const handleScroll = useCallback(() => {
    updateScrollState();
  }, [updateScrollState]);

  // Scroll left by one card - align previous card to left edge
  const scrollPrev = useCallback(() => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const cards = Array.from(
      container.querySelectorAll('[data-carousel-card]'),
    ) as HTMLElement[];

    if (cards.length === 0) return;

    const currentScrollLeft = container.scrollLeft;

    // Find the current card that's closest to the left edge
    let currentCardIndex = 0;
    for (let i = 0; i < cards.length; i++) {
      const cardLeft = cards[i].offsetLeft;
      if (cardLeft >= currentScrollLeft - 5) {
        // 5px tolerance
        currentCardIndex = i;
        break;
      }
    }

    // Move to previous card
    const targetIndex = Math.max(0, currentCardIndex - 1);
    const targetCard = cards[targetIndex];

    container.scrollTo({
      left: targetCard.offsetLeft,
      behavior: 'smooth',
    });
  }, []);

  // Scroll right by one card - align next card to left edge
  const scrollNext = useCallback(() => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const cards = Array.from(
      container.querySelectorAll('[data-carousel-card]'),
    ) as HTMLElement[];

    if (cards.length === 0) return;

    const currentScrollLeft = container.scrollLeft;

    // Find the current card that's closest to the left edge
    let currentCardIndex = 0;
    for (let i = 0; i < cards.length; i++) {
      const cardLeft = cards[i].offsetLeft;
      if (cardLeft >= currentScrollLeft - 5) {
        // 5px tolerance
        currentCardIndex = i;
        break;
      }
    }

    // Move to next card
    const targetIndex = Math.min(cards.length - 1, currentCardIndex + 1);
    const targetCard = cards[targetIndex];

    container.scrollTo({
      left: targetCard.offsetLeft,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className='w-full'>
        {/* Navigation buttons - Top placement */}
        {showNavigation && arrowPlacement === 'top' && (
          <div className={`${navContainerStyles} mb-2`}>
            <button
              className={navButtonStyles}
              onClick={scrollPrev}
              disabled={!scrollState.canScrollLeft}
            >
              <Icon
                variant='arrowleft'
                height={16}
                width={16}
                className='aucctus-stroke-secondary'
              />
            </button>
            <button
              className={navButtonStyles}
              onClick={scrollNext}
              disabled={!scrollState.canScrollRight}
            >
              <Icon
                variant='arrowright'
                height={16}
                width={16}
                className='aucctus-stroke-secondary'
              />
            </button>
          </div>
        )}

        <div
          ref={carouselRef}
          className={carouselStyles}
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className='flex-shrink-0'
              style={{
                width:
                  cardWidth ||
                  Math.max(scrollState.containerWidth - 10, 200) ||
                  undefined,
                marginRight: gap,
                maxWidth:
                  Math.max(scrollState.containerWidth - 10, 200) || undefined,
              }}
              data-carousel-card
            >
              {child}
            </div>
          ))}
        </div>

        {/* Navigation buttons - Bottom placement */}
        {showNavigation && arrowPlacement === 'bottom' && (
          <div className={`${navContainerStyles} mt-2`}>
            <button
              className={navButtonStyles}
              onClick={scrollPrev}
              disabled={!scrollState.canScrollLeft}
            >
              <Icon
                variant='arrowleft'
                height={16}
                width={16}
                className='aucctus-stroke-secondary'
              />
            </button>
            <button
              className={navButtonStyles}
              onClick={scrollNext}
              disabled={!scrollState.canScrollRight}
            >
              <Icon
                variant='arrowright'
                height={16}
                width={16}
                className='aucctus-stroke-secondary'
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ComponentCarousel);
