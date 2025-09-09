import { Button, Icon } from '@components';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RiskLevel } from './fixtures';
import { mockKeyAssumptionsSummary, mockRiskCategories } from './fixtures';

interface KeyAssumptionsCardProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
}

interface RiskColors {
  bg: string;
  border: string;
  text: string;
  icon: string;
}

const KeyAssumptionsCard: React.FC<KeyAssumptionsCardProps> = ({
  currentCardIndex,
  progress,
  totalCards,
  onCardClick,
}) => {
  const navigate = useNavigate();

  // Transform risk level colors to Aucctus theme classes
  const getRiskColor = useCallback((riskLevel: RiskLevel): RiskColors => {
    switch (riskLevel) {
      case 'high':
        return {
          bg: 'aucctus-bg-error-subtle',
          border: 'aucctus-border-error-extra-subtle',
          text: 'aucctus-text-error-primary',
          icon: 'aucctus-stroke-error-primary',
        };
      case 'medium':
        return {
          bg: 'aucctus-bg-warning-subtle',
          border: 'aucctus-border-warning-extra-subtle',
          text: 'aucctus-text-warning-primary',
          icon: 'aucctus-stroke-warning-primary',
        };
      case 'low':
        return {
          bg: 'aucctus-bg-success-subtle',
          border: 'aucctus-border-success-extra-subtle',
          text: 'aucctus-text-success-primary',
          icon: 'aucctus-stroke-success-primary',
        };
      default:
        return {
          bg: 'aucctus-bg-secondary',
          border: 'aucctus-border-secondary',
          text: 'aucctus-text-secondary',
          icon: 'aucctus-stroke-secondary',
        };
    }
  }, []);

  const handleDetailsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate('/assumptions');
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

  // Memoize risk categories with colors
  const riskCategoriesWithColors = useMemo(
    () =>
      mockRiskCategories.map((category) => ({
        ...category,
        colors: getRiskColor(category.riskLevel),
      })),
    [getRiskColor],
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
            <Icon
              variant='alert-triangle'
              className='aucctus-stroke-tertiary h-4 w-4'
            />
            <h3 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
              Key Assumptions
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
          {/* Left - Biggest Risk Summary */}
          <div className='flex flex-col justify-center px-2'>
            <p className='aucctus-text-lg aucctus-text-primary leading-tight'>
              {mockKeyAssumptionsSummary.summary}
            </p>
          </div>

          {/* Right - Risk Category Cards */}
          <div className='grid min-h-0 grid-cols-2 content-center gap-2'>
            {riskCategoriesWithColors.map((category) => (
              <div
                key={category.id}
                className={`border ${category.colors.border} ${category.colors.bg} flex min-h-[80px] flex-col justify-center rounded-lg p-2`}
              >
                <div className='flex h-full flex-col items-center justify-center text-center'>
                  <Icon
                    variant={category.iconVariant as any}
                    className={`h-4 w-4 ${category.colors.icon} mb-1`}
                  />
                  <p className='aucctus-text-xs-semibold aucctus-text-primary leading-tight'>
                    {category.name}
                  </p>
                  <span
                    className={`aucctus-text-xs-semibold mt-1 rounded-full px-1.5 py-0.5 ${category.colors.text} ${category.colors.bg}`}
                  >
                    {category.risk} Risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(KeyAssumptionsCard);
