import React, { useRef, useEffect, useState } from 'react';
import { Icon } from '@components';

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
  cardWidth = '240px',
  gap = '16px',
  showNavigation = true,
  autoScrollToCenter = false,
  centerIndex = -1,
  className = '',
  arrowPlacement = 'bottom',
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateScrollLimits = () => {
      if (carouselRef.current) {
        const containerWidth = carouselRef.current.clientWidth;
        setContainerWidth(containerWidth);
        const scrollWidth = carouselRef.current.scrollWidth;
        const newMaxScroll = Math.max(0, scrollWidth - containerWidth);
        setMaxScroll(newMaxScroll);
      }
    };

    updateScrollLimits();
    window.addEventListener('resize', updateScrollLimits);

    return () => {
      window.removeEventListener('resize', updateScrollLimits);
    };
  }, [children]);

  useEffect(() => {
    if (carouselRef.current && autoScrollToCenter && centerIndex >= 0) {
      setTimeout(() => {
        if (carouselRef.current) {
          const carousel = carouselRef.current;
          const cards = carousel.querySelectorAll('[data-carousel-card]');

          if (cards.length > 0 && centerIndex < cards.length) {
            const targetCard = cards[centerIndex] as HTMLElement;
            const containerWidth = carousel.clientWidth;
            const cardWidth = targetCard.offsetWidth;
            const targetPosition = targetCard.offsetLeft;

            const newScrollPosition =
              targetPosition - containerWidth / 2 + cardWidth / 2;

            carousel.scrollTo({
              left: newScrollPosition,
              behavior: 'smooth',
            });
          }
        }
      }, 100);
    }
  }, [centerIndex, autoScrollToCenter, children]);

  const handleScroll = () => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.clientWidth;
      const scrollWidth = carouselRef.current.scrollWidth;
      const newMaxScroll = Math.max(0, scrollWidth - containerWidth);

      setMaxScroll(newMaxScroll);
    }
  };

  // Helper to get all card elements
  const getCards = () => {
    if (!carouselRef.current) return [];
    return Array.from(
      carouselRef.current.querySelectorAll('[data-carousel-card]'),
    ) as HTMLElement[];
  };

  // Helper to check if a card is fully in view (no partial cutoff)
  const isCardFullyInView = (card: HTMLElement) => {
    if (!carouselRef.current) return false;
    const containerLeft = carouselRef.current.scrollLeft;
    const containerRight = containerLeft + carouselRef.current.clientWidth;
    const cardLeft = card.offsetLeft;
    const cardRight = cardLeft + card.offsetWidth;
    // Only fully in view if the entire card is within the container
    return cardLeft >= containerLeft && cardRight <= containerRight;
  };

  // Arrow disabling logic
  const cards = getCards();
  const firstCardFullyVisible = cards.length > 0 && isCardFullyInView(cards[0]);
  const lastCardFullyVisible =
    cards.length > 0 && isCardFullyInView(cards[cards.length - 1]);

  // Scroll to the previous card so it is fully in view
  const scrollPrev = () => {
    if (!carouselRef.current) return;
    const cards = getCards();
    const containerLeft = carouselRef.current.scrollLeft;
    // Find the last card that is at least partially left of the viewport
    let targetIndex = -1;
    for (let i = cards.length - 1; i >= 0; i--) {
      const card = cards[i];
      const cardRight = card.offsetLeft + card.offsetWidth;
      if (cardRight > containerLeft && card.offsetLeft < containerLeft) {
        // Partially visible on the left
        targetIndex = i;
        break;
      }
      if (cardRight - 1 < containerLeft) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex !== -1) {
      const targetCard = cards[targetIndex];
      carouselRef.current.scrollTo({
        left: targetCard.offsetLeft,
        behavior: 'smooth',
      });
    } else {
      // If no card is left, scroll to start
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Scroll to the next card so it is fully in view (align right edge)
  const scrollNext = () => {
    if (!carouselRef.current) return;
    const cards = getCards();
    const containerLeft = carouselRef.current.scrollLeft;
    const containerRight = containerLeft + carouselRef.current.clientWidth;
    // Find the first card that is at least partially right of the viewport
    let targetIndex = -1;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardLeft = card.offsetLeft;
      const cardRight = cardLeft + card.offsetWidth;
      if (cardLeft < containerRight && cardRight > containerRight) {
        // Partially visible on the right
        targetIndex = i;
        break;
      }
      if (cardLeft >= containerRight - 1) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex !== -1) {
      const targetCard = cards[targetIndex];
      // Align the right edge of the card with the right edge of the carousel
      const newScrollLeft =
        targetCard.offsetLeft +
        targetCard.offsetWidth -
        carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    } else {
      // If no card is right, scroll to end
      carouselRef.current.scrollTo({ left: maxScroll, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className='w-full'>
        {/* Navigation buttons - Top placement */}
        {showNavigation && arrowPlacement === 'top' && (
          <div className={`${navContainerStyles} mb-2`}>
            <button
              className={navButtonStyles}
              onClick={scrollPrev}
              disabled={firstCardFullyVisible}
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
              disabled={lastCardFullyVisible}
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
                width: cardWidth,
                marginRight: gap,
                maxWidth: Math.max(containerWidth - 10, 200) || undefined,
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
              disabled={firstCardFullyVisible}
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
              disabled={lastCardFullyVisible}
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
