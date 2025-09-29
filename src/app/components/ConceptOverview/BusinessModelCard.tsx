import { Button, Icon } from '@components';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IBusinessMetric, BusinessMetricType } from './config';
import { formatCurrency } from '@pages/Concept/Report/FinancialProjections/GenerateRevenue/tabs/MarketSizing/assumptionsUtils';

interface BusinessModelCardProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
  conceptId?: string;
  conceptUuid?: string;
  financialProjectionV2?: any;
  isLoadingFinancial?: boolean;
  // Centralized data props
  executiveSummary?: string;
}

const BusinessModelCard: React.FC<BusinessModelCardProps> = ({
  currentCardIndex,
  progress,
  totalCards,
  onCardClick,
  conceptId,
  financialProjectionV2,
  isLoadingFinancial,
  executiveSummary,
}) => {
  const navigate = useNavigate();

  const handleDetailsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/concept/${conceptId}/financial-projection?tab=business-model`);
    },
    [navigate, conceptId],
  );

  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      onCardClick(index);
    },
    [onCardClick],
  );

  // Create business metrics from real data or fallback to mock
  const businessMetrics = useMemo((): IBusinessMetric[] => {
    if (
      financialProjectionV2 &&
      (financialProjectionV2.businessModel ||
        financialProjectionV2.pricingModel)
    ) {
      const businessModel =
        financialProjectionV2.businessModel?.type || 'B2B2C';
      const price = financialProjectionV2.pricingModel?.price || 4.99;

      return [
        {
          id: '1',
          type: 'model' as BusinessMetricType,
          label: 'Model',
          value: businessModel,
          iconVariant: 'package',
          colorTheme: 'primary' as const,
        },
        {
          id: '2',
          type: 'price' as BusinessMetricType,
          label: 'Price',
          value: formatCurrency(price),
          iconVariant: 'currencydollar',
          colorTheme: 'success' as const,
        },
      ];
    }
    return [];
  }, [financialProjectionV2]);

  // Memoize metric cards with themed styling for performance
  const metricCards = useMemo(() => {
    return businessMetrics.map((metric) => {
      let cardClasses = '';
      let iconClasses = '';
      let labelClasses = '';
      let valueClasses = '';

      switch (metric.colorTheme) {
        case 'primary':
          cardClasses =
            'aucctus-border-brand aucctus-bg-brand-secondary border rounded-lg p-3';
          iconClasses = 'h-4 w-4 aucctus-stroke-info-primary';
          labelClasses = 'aucctus-text-sm-semibold aucctus-text-brand-primary';
          valueClasses = 'aucctus-text-lg-bold aucctus-text-brand-primary';
          break;
        case 'success':
          cardClasses =
            'aucctus-border-success-extra-subtle aucctus-bg-success-subtle border rounded-lg p-3';
          iconClasses = 'h-4 w-4 aucctus-stroke-success-primary';
          labelClasses =
            'aucctus-text-sm-semibold aucctus-text-success-primary';
          valueClasses = 'aucctus-text-lg-bold aucctus-text-success-primary';
          break;
        case 'info':
          cardClasses =
            'aucctus-border-info-extra-subtle aucctus-bg-info-subtle border rounded-lg p-3';
          iconClasses = 'h-4 w-4 aucctus-stroke-info-primary';
          labelClasses = 'aucctus-text-sm-semibold aucctus-text-info-primary';
          valueClasses = 'aucctus-text-lg-bold aucctus-text-info-primary';
          break;
        default:
          cardClasses =
            'aucctus-border-secondary aucctus-bg-tertiary border rounded-lg p-3';
          iconClasses = 'h-4 w-4 aucctus-stroke-secondary';
          labelClasses = 'aucctus-text-sm-semibold aucctus-text-secondary';
          valueClasses = 'aucctus-text-lg-bold aucctus-text-secondary';
      }

      return {
        ...metric,
        cardClasses,
        iconClasses,
        labelClasses,
        valueClasses,
      };
    });
  }, [businessMetrics]);

  const renderMetricCard = useCallback(
    (
      metric: IBusinessMetric & {
        cardClasses: string;
        iconClasses: string;
        labelClasses: string;
        valueClasses: string;
      },
    ) => (
      <div key={metric.id} className={metric.cardClasses}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Icon
              variant={metric.iconVariant as any}
              className={metric.iconClasses}
            />
            <span className={metric.labelClasses}>{metric.label}</span>
          </div>
          <div className={metric.valueClasses}>{metric.value}</div>
        </div>
      </div>
    ),
    [],
  );

  return (
    <div className='aucctus-bg-secondary aucctus-border-secondary h-full min-h-[350px] cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg'>
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
              variant='currencydollar'
              className='aucctus-stroke-tertiary h-4 w-4'
            />
            <h3 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
              Business Model
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

        {executiveSummary ? (
          // Two-column layout: Summary + Metrics
          <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Left - Business Model Summary */}
            <div className='flex flex-col justify-center px-2'>
              <p className='aucctus-text-sm-semibold aucctus-text-primary'>
                {executiveSummary}
              </p>
            </div>

            {/* Right - Key Metrics Cards */}
            <div className='flex min-h-0 flex-col items-center justify-center gap-3'>
              {isLoadingFinancial ? (
                <div className='aucctus-text-lg aucctus-text-secondary'>
                  Loading metrics...
                </div>
              ) : metricCards.length > 0 ? (
                <div className='w-full max-w-[220px] space-y-3'>
                  {metricCards.map(renderMetricCard)}
                </div>
              ) : (
                <div className='aucctus-text-sm aucctus-text-secondary'>
                  No business metrics available
                </div>
              )}
            </div>
          </div>
        ) : (
          // Single-column layout: Metrics only (expanded)
          <div className='flex flex-1 items-center justify-center'>
            {isLoadingFinancial ? (
              <div className='aucctus-text-lg aucctus-text-secondary'>
                Loading metrics...
              </div>
            ) : metricCards.length > 0 ? (
              <div className='w-full max-w-[380px] space-y-4'>
                {metricCards.map(renderMetricCard)}
              </div>
            ) : (
              <div className='aucctus-text-sm aucctus-text-secondary'>
                No business metrics available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(BusinessModelCard);
