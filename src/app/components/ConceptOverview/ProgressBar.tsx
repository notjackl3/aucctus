import React from 'react';

interface ProgressBarProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
}

/**
 * Isolated progress bar component that re-renders independently
 * from the card content to optimize performance
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  currentCardIndex,
  progress,
  totalCards,
  onCardClick,
}) => {
  return (
    <div className='mb-4'>
      <div className='flex gap-1'>
        {Array.from({ length: totalCards }).map((_, index: number) => (
          <div key={index} className='flex-1'>
            <div
              className='aucctus-bg-disabled h-1 cursor-pointer overflow-hidden rounded-full'
              onClick={(e) => {
                e.stopPropagation();
                onCardClick(index);
              }}
            >
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  index === currentCardIndex
                    ? 'aucctus-bg-primary-solid'
                    : index < currentCardIndex
                      ? 'aucctus-bg-primary-solid'
                      : 'bg-transparent'
                }`}
                style={{
                  width:
                    index === currentCardIndex
                      ? `${Math.min(progress, 100)}%`
                      : index < currentCardIndex
                        ? '100%'
                        : '0%',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple memo - will re-render when progress or currentCardIndex changes
export default React.memo(ProgressBar);
