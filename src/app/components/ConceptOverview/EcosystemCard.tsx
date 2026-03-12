import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConceptReportContext } from '@pages/Concept/Report/ConceptReport/ConceptReportContext';
import type { IEcosystemPlayer } from './config';
import ProgressBar from './ProgressBar';
import { useEcosystem } from '../EcosystemV2/hooks/useEcosystem';
import type { IConcept } from '@libs/api/types';
import { Globe } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface EcosystemCardProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
  conceptId?: string;
  conceptUuid?: string;
  // Centralized data props
  marketScan?: any;
  isLoadingMarketScan?: boolean;
  executiveSummary?: string;
  // Concept to check feature version
  concept?: IConcept;
}

const EcosystemCard: React.FC<EcosystemCardProps> = ({
  currentCardIndex,
  progress,
  totalCards,
  onCardClick,
  conceptId,
  conceptUuid,
  marketScan,
  isLoadingMarketScan = false,
  executiveSummary,
  concept,
}) => {
  const navigate = useNavigate();
  const { isReadOnly, navigateToTab } = useConceptReportContext();

  // Check if concept is using V2 ecosystem
  const isEcosystemV2 = concept?.featureVersions?.ecosystem === 'v2';

  // Fetch V2 ecosystem data if the concept is using V2
  const { ecosystemData: v2EcosystemData, isLoading: isLoadingV2 } =
    useEcosystem(isEcosystemV2 && conceptUuid ? conceptUuid : '');

  // Create ecosystem players from real data
  // Use V2 data if ecosystem version is v2, otherwise fallback to V1 marketScan data
  const ecosystemPlayers = useMemo((): IEcosystemPlayer[] => {
    // Use V2 ecosystem data when available
    if (isEcosystemV2 && v2EcosystemData && v2EcosystemData.length > 0) {
      const startupsCount = v2EcosystemData.filter(
        (company) => company.type === 'startup',
      ).length;
      const incumbentsCount = v2EcosystemData.filter(
        (company) => company.type === 'incumbent',
      ).length;

      if (startupsCount > 0 || incumbentsCount > 0) {
        return [
          {
            id: '1',
            type: 'startups',
            name: 'Startups',
            count: startupsCount,
            iconVariant: 'lightbulb',
            description: 'Emerging companies disrupting the market',
          },
          {
            id: '2',
            type: 'incumbents',
            name: 'Incumbents',
            count: incumbentsCount,
            iconVariant: 'building',
            description: 'Established market leaders',
          },
        ];
      }
    }

    // Fallback to V1 marketScan data
    if (
      marketScan &&
      (marketScan.startups?.length > 0 || marketScan.incumbents?.length > 0)
    ) {
      return [
        {
          id: '1',
          type: 'startups',
          name: 'Startups',
          count: marketScan.startups?.length || 0,
          iconVariant: 'lightbulb',
          description: 'Emerging companies disrupting the market',
        },
        {
          id: '2',
          type: 'incumbents',
          name: 'Incumbents',
          count: marketScan.incumbents?.length || 0,
          iconVariant: 'building',
          description: 'Established market leaders',
        },
      ];
    }
    return [];
  }, [isEcosystemV2, v2EcosystemData, marketScan]);

  // Get real summary data (no mock fallback)
  const ecosystemSummary = executiveSummary || null;

  const handleDetailsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isReadOnly) {
        navigateToTab('ecosystem');
      } else {
        navigate(`/concept/${conceptId}/ecosystem`);
      }
    },
    [navigate, conceptId, isReadOnly, navigateToTab],
  );

  // Memoize player cards for performance
  const playerCards = useMemo(() => {
    return ecosystemPlayers.map((player) => {
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
  }, [ecosystemPlayers]);

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
            <DynamicIcon
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
    <div className='aucctus-bg-primary aucctus-border-secondary h-full min-h-[350px] cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg'>
      <div className='flex h-full flex-col p-6'>
        {/* Progress Bar Navigation - Isolated component for performance */}
        <ProgressBar
          currentCardIndex={currentCardIndex}
          progress={progress}
          totalCards={totalCards}
          onCardClick={onCardClick}
        />

        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Globe className='aucctus-stroke-tertiary h-4 w-4' />
            <h3 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
              Ecosystem
            </h3>
          </div>
          <button
            onClick={handleDetailsClick}
            className='aucctus-bg-primary-hover aucctus-text-sm-medium aucctus-text-secondary-hover rounded-lg px-3 py-1.5'
          >
            Details
          </button>
        </div>

        {ecosystemSummary ? (
          // Two-column layout: Summary + Player Cards
          <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Left - Competitive Landscape Summary */}
            <div className='flex flex-col justify-start px-2'>
              {isLoadingMarketScan || (isEcosystemV2 && isLoadingV2) ? (
                <div className='aucctus-text-lg aucctus-text-secondary'>
                  Loading ecosystem data...
                </div>
              ) : (
                <p className='aucctus-text-md-semibold aucctus-text-primary'>
                  {ecosystemSummary}
                </p>
              )}
            </div>

            {/* Right - Player Count Cards */}
            <div className='flex min-h-0 flex-col items-center justify-center gap-4'>
              <div className='w-full max-w-[220px] space-y-3'>
                {playerCards.length > 0 ? (
                  playerCards.map(renderPlayerCard)
                ) : (
                  <div className='aucctus-text-sm aucctus-text-secondary text-center'>
                    No ecosystem data available
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Single-column layout: Player Cards only (expanded)
          <div className='flex flex-1 items-center justify-center'>
            {isLoadingMarketScan || (isEcosystemV2 && isLoadingV2) ? (
              <div className='aucctus-text-lg aucctus-text-secondary'>
                Loading ecosystem data...
              </div>
            ) : playerCards.length > 0 ? (
              <div className='w-full max-w-[380px] space-y-4'>
                {playerCards.map(renderPlayerCard)}
              </div>
            ) : (
              <div className='aucctus-text-sm aucctus-text-secondary'>
                No ecosystem data available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EcosystemCard;
