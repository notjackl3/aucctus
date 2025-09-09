import { Button, Icon } from '@components';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IEcosystemPlayer } from './fixtures';
import { mockEcosystemPlayers, mockEcosystemSummary } from './fixtures';

interface EcosystemCardProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
}

const EcosystemCard: React.FC<EcosystemCardProps> = ({
  currentCardIndex,
  progress,
  totalCards,
  onCardClick,
}) => {
  const navigate = useNavigate();

  const handleDetailsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate('/market-scan');
    },
    [navigate],
  );

  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      onCardClick(index);
    },
    [onCardClick],
  );

  // Memoize player cards for performance
  const playerCards = useMemo(() => {
    return mockEcosystemPlayers.map((player) => {
      const isStartup = player.type === 'startups';

      return {
        ...player,
        cardClasses: isStartup
          ? 'aucctus-border-brand aucctus-bg-brand-secondary border rounded-lg p-4'
          : 'aucctus-border-brand aucctus-bg-brand-primary border rounded-lg p-4',
        iconClasses: isStartup
          ? 'h-4 w-4 aucctus-stroke-brand-primary'
          : 'h-4 w-4 aucctus-stroke-brand-secondary',
        nameClasses: isStartup
          ? 'aucctus-text-sm-semibold aucctus-text-brand-primary'
          : 'aucctus-text-sm-semibold aucctus-text-brand-secondary',
        countClasses: isStartup
          ? 'aucctus-header-xs-bold aucctus-text-brand-primary'
          : 'aucctus-header-xs-bold aucctus-text-brand-secondary',
      };
    });
  }, []);

  const renderPlayerCard = useCallback(
    (
      player: IEcosystemPlayer & {
        cardClasses: string;
        iconClasses: string;
        nameClasses: string;
        countClasses: string;
      },
    ) => (
      <div key={player.id} className={player.cardClasses}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Icon
              variant={player.iconVariant as any}
              className={player.iconClasses}
            />
            <span className={player.nameClasses}>{player.name}</span>
          </div>
          <div className={player.countClasses}>{player.count}</div>
        </div>
      </div>
    ),
    [],
  );

  return (
    <div className='aucctus-bg-secondary aucctus-border-secondary h-[320px] cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg'>
      <div className='flex h-full flex-col p-6'>
        {/* Progress Bar Navigation */}
        <div className='mb-4'>
          <div className='flex gap-2'>
            {Array.from({ length: totalCards }).map((_, index) => (
              <div key={index} className='flex-1'>
                <div
                  className='aucctus-bg-disabled h-1 cursor-pointer overflow-hidden rounded-full'
                  onClick={(e) => handleProgressBarClick(e, index)}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      index === currentCardIndex
                        ? 'aucctus-bg-primary-solid'
                        : index < currentCardIndex
                          ? 'aucctus-bg-primary-solid'
                          : 'bg-transparent'
                    }`}
                    style={{
                      width:
                        index === currentCardIndex
                          ? `${progress}%`
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

        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Icon variant='globe' className='aucctus-stroke-tertiary h-4 w-4' />
            <h3 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
              Ecosystem
            </h3>
          </div>
          <Button
            color='secondary'
            size='sm'
            onClick={handleDetailsClick}
            className='aucctus-text-sm-medium aucctus-text-secondary-hover'
          >
            Details
          </Button>
        </div>

        <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Left - Competitive Landscape Summary */}
          <div className='flex flex-col justify-center px-2'>
            <p className='aucctus-text-lg aucctus-text-primary leading-tight'>
              {mockEcosystemSummary.summary}
            </p>
          </div>

          {/* Right - Player Count Cards */}
          <div className='flex min-h-0 flex-col items-center justify-center gap-4'>
            <div className='w-full max-w-[200px] space-y-3'>
              {playerCards.map(renderPlayerCard)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EcosystemCard);
