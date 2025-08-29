import { ComponentCarousel, Icon } from '@components';
import { cn } from '@libs/utils/react';
import React from 'react';
import AiResearchMetrics from '../AiResearchMetrics/AiResearchMetrics';
import DocumentUpload from '../DocumentUpload/DocumentUpload';
import {
  aiResearchMetrics,
  longTermFactors,
  midTermFactors,
  shortTermFactors,
} from '../NucleusPage/fixtures';
import { overviewUIText } from './fixtures';
import { OverviewProps, RiskFactor } from './types';

const Overview: React.FC<OverviewProps> = ({
  disruptionRisk,
  activeTimelineTab,
  setActiveTimelineTab,
}) => {
  const getRiskFactors = (): RiskFactor[] => {
    switch (activeTimelineTab) {
      case 'short':
        return shortTermFactors;
      case 'mid':
        return midTermFactors;
      case 'long':
        return longTermFactors;
      default:
        return shortTermFactors;
    }
  };

  const factors = getRiskFactors();

  return (
    <div className='relative z-30 mx-auto mb-8 mt-8 max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12'>
        {/* Disruption Risk Analysis */}
        <div className='lg:col-span-6'>
          <div className='aucctus-bg-secondary aucctus-border-primary relative h-full overflow-hidden rounded-lg border p-3 shadow-sm sm:p-4'>
            <div className='flex h-full flex-col lg:flex-row'>
              {/* Left Side - Risk Grading */}
              <div className='mb-4 flex w-full flex-col lg:mb-0 lg:w-[35%] lg:pr-6'>
                <div className='space-y-3 sm:space-y-4'>
                  <div className='flex items-center gap-2'>
                    <p className='aucctus-text-xs-semibold aucctus-text-tertiary uppercase tracking-widest'>
                      {overviewUIText.disruptionRiskAnalysis.title}
                    </p>
                    <Icon
                      variant='help-circle'
                      className='aucctus-text-tertiary hover:aucctus-text-primary h-3 w-3 cursor-help'
                    />
                  </div>

                  <div className='space-y-3'>
                    <div className='flex justify-start'>
                      <div className='flex gap-0.5'>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              'h-4 w-1.5 rounded-sm transition-all duration-500 sm:h-6 sm:w-2',
                              {
                                'aucctus-bg-error-solid shadow-sm':
                                  level <=
                                    Math.ceil((disruptionRisk / 100) * 10) &&
                                  disruptionRisk > 60,
                                'aucctus-bg-warning-solid shadow-sm':
                                  level <=
                                    Math.ceil((disruptionRisk / 100) * 10) &&
                                  disruptionRisk > 30 &&
                                  disruptionRisk <= 60,
                                'aucctus-bg-success-solid shadow-sm':
                                  level <=
                                    Math.ceil((disruptionRisk / 100) * 10) &&
                                  disruptionRisk <= 30,
                                'aucctus-bg-quaternary':
                                  level >
                                  Math.ceil((disruptionRisk / 100) * 10),
                              },
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className='text-left'>
                      <h2
                        className={cn(
                          'aucctus-header-xs-bold sm:aucctus-header-sm-bold mb-2 leading-tight',
                          {
                            'aucctus-text-error-primary': disruptionRisk > 60,
                            'aucctus-text-warning-primary':
                              disruptionRisk > 30 && disruptionRisk <= 60,
                            'aucctus-text-success-primary':
                              disruptionRisk <= 30,
                          },
                        )}
                      >
                        {disruptionRisk > 60
                          ? overviewUIText.disruptionRiskAnalysis.riskLevels
                              .high
                          : disruptionRisk > 30
                            ? overviewUIText.disruptionRiskAnalysis.riskLevels
                                .moderate
                            : overviewUIText.disruptionRiskAnalysis.riskLevels
                                .low}
                      </h2>
                      <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                        {disruptionRisk > 60
                          ? overviewUIText.disruptionRiskAnalysis.descriptions
                              .high
                          : disruptionRisk > 30
                            ? overviewUIText.disruptionRiskAnalysis.descriptions
                                .moderate
                            : overviewUIText.disruptionRiskAnalysis.descriptions
                                .low}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Timeline Tabs */}
              <div className='aucctus-border-secondary flex w-full flex-col lg:w-[65%] lg:border-l lg:pl-6'>
                <p className='aucctus-text-xs-semibold aucctus-text-tertiary mb-2 uppercase tracking-widest'>
                  {overviewUIText.riskConsiderations.title}
                </p>
                <div className='flex flex-1 flex-col'>
                  <div className='mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex h-auto w-full gap-1 border-0 bg-transparent p-0 sm:w-auto'>
                      {['short', 'mid', 'long'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTimelineTab(tab)}
                          className={cn({
                            'aucctus-border-primary/30 aucctus-bg-brand-secondary aucctus-text-brand-primary':
                              activeTimelineTab === tab,
                            'aucctus-bg-disabled aucctus-text-tertiary hover:aucctus-bg-secondary-hover':
                              activeTimelineTab !== tab,
                            'aucctus-text-xs aucctus-text-sm-medium h-auto flex-1 rounded border px-2 py-1 transition-all duration-200 sm:flex-initial':
                              true,
                          })}
                        >
                          {tab === 'short'
                            ? overviewUIText.riskConsiderations.timelineTabs
                                .short
                            : tab === 'mid'
                              ? overviewUIText.riskConsiderations.timelineTabs
                                  .mid
                              : overviewUIText.riskConsiderations.timelineTabs
                                  .long}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='w-full min-w-0 flex-1 overflow-hidden'>
                    <ComponentCarousel
                      cardWidth='240px'
                      gap='16px'
                      className='mt-6'
                      showNavigation={true}
                    >
                      {factors.map((factor, index) => (
                        <div
                          key={index}
                          className='aucctus-bg-disabled aucctus-border-secondary w-full rounded-lg border p-2 shadow-sm sm:p-3'
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex-1 pr-2'>
                              <p className='aucctus-text-xs aucctus-text-primary aucctus-text-sm-medium sm:aucctus-text-sm leading-tight'>
                                {factor.text}
                              </p>
                            </div>
                            <div className='flex-shrink-0'>
                              <div
                                className={cn('rounded-full p-1', {
                                  'aucctus-bg-success-secondary':
                                    factor.type === 'tailwind',
                                  'aucctus-bg-error-secondary':
                                    factor.type === 'headwind',
                                  'aucctus-bg-warning-secondary':
                                    factor.type === 'watch',
                                })}
                              >
                                <Icon
                                  variant={
                                    factor.type === 'tailwind'
                                      ? 'trendup'
                                      : factor.type === 'headwind'
                                        ? 'decreasing'
                                        : 'eye'
                                  }
                                  className={cn('h-3 w-3 sm:h-4 sm:w-4', {
                                    'aucctus-text-success-primary':
                                      factor.type === 'tailwind',
                                    'aucctus-text-error-primary':
                                      factor.type === 'headwind',
                                    'aucctus-text-warning-primary':
                                      factor.type === 'watch',
                                  })}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </ComponentCarousel>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Research Metrics */}
        <div className='lg:col-span-3'>
          <AiResearchMetrics metrics={aiResearchMetrics} />
        </div>

        {/* Upload & Connect Widgets */}
        <div className='flex flex-col gap-3 lg:col-span-3'>
          {/* Document Upload Widget */}
          <DocumentUpload />
          {/* Connect Accounts Widget */}
          <div className='flex-1'>
            <div className='aucctus-bg-secondary aucctus-border-primary relative h-full rounded-lg border p-3 shadow-sm sm:p-4'>
              <div className='mb-3 flex items-center justify-between'>
                <h3 className='aucctus-text-xs-semibold aucctus-text-tertiary uppercase tracking-widest'>
                  {overviewUIText.connectAccounts.title}
                </h3>
                <Icon
                  variant='lock'
                  className='aucctus-text-tertiary h-3 w-3'
                />
              </div>
              <div className='flex items-center justify-start gap-3 opacity-40 grayscale sm:gap-4'>
                {overviewUIText.connectAccounts.services.map((service) => (
                  <div key={service.id} className='flex flex-col items-center'>
                    <div
                      className={cn(
                        'mb-1 flex h-6 w-6 items-center justify-center sm:h-8 sm:w-8',
                        service.icon.shape === 'rounded-full'
                          ? 'rounded-full'
                          : 'rounded',
                      )}
                      style={{
                        background:
                          service.icon.type === 'gradient'
                            ? `linear-gradient(to bottom right, ${(service.icon.colors as string[]).join(', ')})`
                            : (service.icon.colors as string),
                      }}
                    >
                      <div
                        className={cn(
                          'h-3 w-3 bg-white sm:h-4 sm:w-4',
                          service.icon.shape === 'rounded-full'
                            ? 'rounded-full'
                            : 'rounded-sm',
                        )}
                      />
                    </div>
                    <span className='aucctus-text-xs aucctus-text-secondary'>
                      {service.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
