import { FunctionComponent, useState } from 'react';
import { Icon } from '@components';
import {
  IPocRisk,
  RiskSeverity,
  RiskLikelihood,
  PocRiskCategory,
} from '@libs/api/types';
import { cn } from '@libs/utils/react';

interface IRisksSectionProps {
  risks: IPocRisk[];
}

const SEVERITY_CONFIG: Record<
  RiskSeverity,
  { label: string; color: string; bgColor: string }
> = {
  low: {
    label: 'Low',
    color: 'text-success-600',
    bgColor: 'bg-success-100 dark:bg-success-900',
  },
  medium: {
    label: 'Medium',
    color: 'text-warning-600',
    bgColor: 'bg-warning-100 dark:bg-warning-900',
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
  },
  critical: {
    label: 'Critical',
    color: 'text-error-600',
    bgColor: 'bg-error-100 dark:bg-error-900',
  },
};

const LIKELIHOOD_CONFIG: Record<
  RiskLikelihood,
  { label: string; color: string; bgColor: string }
> = {
  unlikely: {
    label: 'Unlikely',
    color: 'text-success-600',
    bgColor: 'bg-success-100 dark:bg-success-900',
  },
  possible: {
    label: 'Possible',
    color: 'text-warning-600',
    bgColor: 'bg-warning-100 dark:bg-warning-900',
  },
  likely: {
    label: 'Likely',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
  },
  very_likely: {
    label: 'Very Likely',
    color: 'text-error-600',
    bgColor: 'bg-error-100 dark:bg-error-900',
  },
};

const CATEGORY_LABELS: Record<PocRiskCategory, string> = {
  technical: 'Technical',
  market: 'Market',
  financial: 'Financial',
  operational: 'Operational',
  regulatory: 'Regulatory',
};

const RiskItem: FunctionComponent<{
  risk: IPocRisk;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ risk, isExpanded, onToggle }) => {
  const severityConfig = SEVERITY_CONFIG[risk.severity];
  const likelihoodConfig = LIKELIHOOD_CONFIG[risk.likelihood];

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg',
        'aucctus-bg-secondary',
        'transition-all duration-200',
        'overflow-hidden',
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center justify-between gap-3 p-4',
          'hover:aucctus-bg-tertiary transition-colors',
          'w-full text-left',
        )}
      >
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              risk.severity === 'critical' && 'bg-error-500',
              risk.severity === 'high' && 'bg-orange-500',
              risk.severity === 'medium' && 'bg-warning-500',
              risk.severity === 'low' && 'bg-success-500',
            )}
          />
          <span className='aucctus-text-primary aucctus-text-sm-medium'>
            {risk.title}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs',
              severityConfig.bgColor,
              severityConfig.color,
            )}
          >
            {severityConfig.label}
          </span>
          <Icon
            variant='chevrondown'
            className={cn(
              'aucctus-stroke-tertiary h-4 w-4 transition-transform',
              isExpanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className='flex flex-col gap-3 px-4 pb-4'>
          <p className='aucctus-text-secondary aucctus-text-sm'>
            {risk.description}
          </p>

          {/* Risk Matrix */}
          <div className='flex gap-4'>
            <div className='flex items-center gap-2'>
              <span className='aucctus-text-tertiary aucctus-text-xs'>
                Severity:
              </span>
              <span
                className={cn(
                  'rounded px-2 py-0.5 text-xs',
                  severityConfig.bgColor,
                  severityConfig.color,
                )}
              >
                {severityConfig.label}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='aucctus-text-tertiary aucctus-text-xs'>
                Likelihood:
              </span>
              <span
                className={cn(
                  'rounded px-2 py-0.5 text-xs',
                  likelihoodConfig.bgColor,
                  likelihoodConfig.color,
                )}
              >
                {likelihoodConfig.label}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='aucctus-text-tertiary aucctus-text-xs'>
                Category:
              </span>
              <span className='aucctus-text-primary aucctus-text-xs'>
                {CATEGORY_LABELS[risk.category]}
              </span>
            </div>
          </div>

          {/* Mitigation */}
          <div className='aucctus-bg-primary flex flex-col gap-1 rounded-md p-3'>
            <span className='aucctus-text-tertiary aucctus-text-xs-semibold uppercase'>
              Mitigation Strategy
            </span>
            <p className='aucctus-text-primary aucctus-text-sm'>
              {risk.mitigationStrategy}
            </p>
          </div>

          {/* Contingency */}
          {risk.contingencyPlan && (
            <div className='flex flex-col gap-1'>
              <span className='aucctus-text-tertiary aucctus-text-xs-semibold uppercase'>
                Contingency Plan
              </span>
              <p className='aucctus-text-secondary aucctus-text-sm'>
                {risk.contingencyPlan}
              </p>
            </div>
          )}

          {/* Owner */}
          {risk.owner && (
            <div className='flex items-center gap-2'>
              <Icon
                variant='user'
                className='aucctus-stroke-tertiary h-4 w-4'
              />
              <span className='aucctus-text-tertiary aucctus-text-xs'>
                Owner: {risk.owner}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Risk Matrix Component
const RiskMatrix: FunctionComponent<{ risks: IPocRisk[] }> = ({ risks }) => {
  const severityLevels: RiskSeverity[] = ['low', 'medium', 'high', 'critical'];
  const likelihoodLevels: RiskLikelihood[] = [
    'unlikely',
    'possible',
    'likely',
    'very_likely',
  ];

  // Group risks by severity × likelihood
  const getRisksInCell = (
    severity: RiskSeverity,
    likelihood: RiskLikelihood,
  ): IPocRisk[] => {
    return risks.filter(
      (r) => r.severity === severity && r.likelihood === likelihood,
    );
  };

  // Get cell color based on combined risk level
  const getCellColor = (
    severity: RiskSeverity,
    likelihood: RiskLikelihood,
  ): string => {
    const severityValue = severityLevels.indexOf(severity);
    const likelihoodValue = likelihoodLevels.indexOf(likelihood);
    const combined = severityValue + likelihoodValue;

    if (combined >= 5) return 'bg-error-100 dark:bg-error-900/50';
    if (combined >= 3) return 'bg-warning-100 dark:bg-warning-900/50';
    if (combined >= 1) return 'bg-success-100 dark:bg-success-900/50';
    return 'aucctus-bg-tertiary';
  };

  return (
    <div className='flex flex-col gap-2'>
      <span className='aucctus-text-tertiary aucctus-text-xs-semibold uppercase tracking-wider'>
        Risk Matrix
      </span>
      <div className='flex gap-2'>
        {/* Y-axis label */}
        <div className='flex w-6 items-center justify-center'>
          <span
            className='aucctus-text-tertiary text-[10px] font-medium uppercase tracking-wider'
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Likelihood
          </span>
        </div>

        <div className='flex-1'>
          {/* Matrix grid */}
          <div className='grid grid-cols-4 gap-1'>
            {/* Render from high likelihood (top) to low likelihood (bottom) */}
            {[...likelihoodLevels].reverse().map((likelihood) =>
              severityLevels.map((severity) => {
                const cellRisks = getRisksInCell(severity, likelihood);
                return (
                  <div
                    key={`${severity}-${likelihood}`}
                    className={cn(
                      'relative flex h-12 items-center justify-center rounded-lg',
                      getCellColor(severity, likelihood),
                      'transition-all duration-200',
                      cellRisks.length > 0 &&
                        'ring-1 ring-inset ring-black/10 dark:ring-white/10',
                    )}
                  >
                    {cellRisks.length > 0 && (
                      <div className='flex items-center justify-center gap-0.5'>
                        {cellRisks.slice(0, 3).map((risk) => (
                          <div
                            key={risk.uuid}
                            className={cn(
                              'h-3 w-3 rounded-full border border-white',
                              risk.severity === 'critical' && 'bg-error-500',
                              risk.severity === 'high' && 'bg-orange-500',
                              risk.severity === 'medium' && 'bg-warning-500',
                              risk.severity === 'low' && 'bg-success-500',
                            )}
                            title={risk.title}
                          />
                        ))}
                        {cellRisks.length > 3 && (
                          <span className='aucctus-text-primary ml-0.5 text-[9px] font-medium'>
                            +{cellRisks.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              }),
            )}
          </div>

          {/* X-axis labels */}
          <div className='mt-1 grid grid-cols-4 gap-1'>
            {severityLevels.map((severity) => (
              <div key={severity} className='text-center'>
                <span className='aucctus-text-tertiary text-[10px] capitalize'>
                  {severity}
                </span>
              </div>
            ))}
          </div>
          <div className='mt-1 text-center'>
            <span className='aucctus-text-tertiary text-[10px] font-medium uppercase tracking-wider'>
              Severity
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const RisksSection: FunctionComponent<IRisksSectionProps> = ({ risks }) => {
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  // Sort risks by severity
  const sortedRisks = [...risks].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Count by severity
  const criticalCount = risks.filter((r) => r.severity === 'critical').length;
  const highCount = risks.filter((r) => r.severity === 'high').length;

  return (
    <div
      className={cn(
        'flex flex-col gap-5 rounded-xl p-6',
        'aucctus-bg-primary',
        'aucctus-border-primary border',
        'shadow-sm',
      )}
    >
      {/* Section Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='aucctus-bg-brand-secondary flex h-10 w-10 items-center justify-center rounded-lg'>
            <Icon
              variant='alert-triangle'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
          </div>
          <div className='flex flex-col'>
            <h2 className='aucctus-text-primary aucctus-header-sm-semibold'>
              Risk Assessment
            </h2>
            <span className='aucctus-text-tertiary aucctus-text-xs'>
              {risks.length} risks identified
            </span>
          </div>
        </div>
      </div>

      {/* Risk Matrix + Summary in 2 columns */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {/* Risk Matrix */}
        <RiskMatrix risks={risks} />

        {/* Risk Summary */}
        <div className='flex flex-col gap-3'>
          <span className='aucctus-text-tertiary aucctus-text-xs-semibold uppercase tracking-wider'>
            Summary
          </span>
          <div className='flex flex-col gap-2'>
            {severityLevels
              .map((severity) => {
                const count = risks.filter(
                  (r) => r.severity === severity,
                ).length;
                const config = SEVERITY_CONFIG[severity];
                return (
                  <div
                    key={severity}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          severity === 'critical' && 'bg-error-500',
                          severity === 'high' && 'bg-orange-500',
                          severity === 'medium' && 'bg-warning-500',
                          severity === 'low' && 'bg-success-500',
                        )}
                      />
                      <span className='aucctus-text-secondary aucctus-text-sm'>
                        {config.label}
                      </span>
                    </div>
                    <span
                      className={cn('aucctus-text-sm-semibold', config.color)}
                    >
                      {count}
                    </span>
                  </div>
                );
              })
              .reverse()}
          </div>

          {/* Alert for critical/high */}
          {(criticalCount > 0 || highCount > 0) && (
            <div
              className={cn(
                'mt-2 flex items-center gap-3 rounded-lg p-3',
                'bg-error-50 dark:bg-error-950',
                'border border-error-200 dark:border-error-800',
              )}
            >
              <Icon
                variant='alert-circle'
                className='h-4 w-4 flex-shrink-0 stroke-error-500'
              />
              <span className='text-xs text-error-700 dark:text-error-300'>
                {criticalCount + highCount} priority{' '}
                {criticalCount + highCount === 1
                  ? 'risk requires'
                  : 'risks require'}{' '}
                attention
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Risks List */}
      <div className='flex flex-col gap-2'>
        {sortedRisks.map((risk) => (
          <RiskItem
            key={risk.uuid}
            risk={risk}
            isExpanded={expandedRisk === risk.uuid}
            onToggle={() =>
              setExpandedRisk(expandedRisk === risk.uuid ? null : risk.uuid)
            }
          />
        ))}
      </div>
    </div>
  );
};

const severityLevels: RiskSeverity[] = ['low', 'medium', 'high', 'critical'];

export default RisksSection;
