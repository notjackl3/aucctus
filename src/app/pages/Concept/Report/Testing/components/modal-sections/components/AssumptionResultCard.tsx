import React, { useState, useMemo } from 'react';
import { Icon } from '@components';
import { AssumptionCategory } from '@libs/api/types';
import {
  IAssumptionValidation,
  ITestLearning,
} from '@libs/api/types/concept/testing';
import CategoryIcon from '../../../../Assumptions/components/cards/category-progress-card/CategoryIcon';
import { cn } from '@libs/utils/react';
import SourceBadges from './SourceBadges';

export interface Finding {
  id: string;
  title: string;
  impact: string;
  sources?: string[];
}

interface AssumptionResultCardProps {
  assumptionUuid: string;
  category: AssumptionCategory;
  statement: string;
  benchmark: string;
  benchmarkAchieved: boolean;
  assumptionValidationsMap: Map<string, IAssumptionValidation>;
  learningsMap: Map<string, ITestLearning>;
  onSourceClick?: (source: string) => void;
}

const AssumptionResultCard: React.FC<AssumptionResultCardProps> = ({
  assumptionUuid,
  category,
  statement,
  benchmark,
  benchmarkAchieved,
  assumptionValidationsMap,
  learningsMap,
  onSourceClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive findings from the validation and learnings maps
  const findings = useMemo((): Finding[] => {
    const validation = assumptionValidationsMap.get(assumptionUuid);
    if (!validation) return [];

    // Get supporting learnings from the map
    const supportingLearnings = validation.supportingLearningUuids
      .map((uuid) => learningsMap.get(uuid))
      .filter((learning): learning is ITestLearning => !!learning);

    // Create findings from the validation data
    // Option 1: Create a single finding from the validation evidence
    const findings: Finding[] = [];

    if (validation.evidence) {
      findings.push({
        id: `${assumptionUuid}-evidence`,
        title: validation.evidence,
        impact: validation.impactAnalysis,
        sources: supportingLearnings
          .map((l) => l.sourceFilename)
          .filter(Boolean),
      });
    }

    // Option 2: Also add individual learnings as separate findings
    supportingLearnings.forEach((learning) => {
      findings.push({
        id: learning.uuid,
        title: learning.learning,
        impact: learning.impact,
        sources: learning.sourceFilename ? [learning.sourceFilename] : [],
      });
    });

    return findings;
  }, [assumptionUuid, assumptionValidationsMap, learningsMap]);

  // Determine benchmark section styling based on achieved status
  const getBenchmarkStyles = () => {
    if (benchmarkAchieved) {
      return {
        container: 'aucctus-bg-success-secondary border-emerald-200',
        icon: 'aucctus-stroke-success-primary',
        text: 'aucctus-text-success-primary',
      };
    }
    return {
      container: 'aucctus-bg-error-subtle border-red-200',
      icon: 'aucctus-stroke-error-primary',
      text: 'aucctus-text-error-primary',
    };
  };

  const benchmarkStyles = getBenchmarkStyles();

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-lg border shadow-sm'>
      {/* Header - Clickable to expand/collapse */}
      <div
        className='flex cursor-pointer transition-colors hover:bg-gray-50/50'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left side - The Assumption */}
        <div className='flex-1 p-5'>
          {/* Category row */}
          <div className='mb-4 flex items-center space-x-2'>
            <CategoryIcon category={category} />
            <span className='aucctus-text-sm-medium aucctus-text-primary capitalize'>
              {category}
            </span>
          </div>

          {/* Assumption statement */}
          <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
            {statement}
          </h3>
        </div>

        {/* Right side - Validation Benchmark/Threshold */}
        <div
          className={cn(
            'flex w-80 flex-col justify-center border-l p-4',
            benchmarkStyles.container,
          )}
        >
          <div className='mb-2 flex items-center gap-2'>
            <div
              className={cn(
                'rounded-full p-1',
                benchmarkAchieved
                  ? 'aucctus-bg-success-primary'
                  : 'aucctus-bg-error-secondary',
              )}
            >
              <Icon
                variant='target-round'
                className={cn('h-3 w-3', benchmarkStyles.icon)}
              />
            </div>
            <div className='flex flex-1 items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'aucctus-text-xs-medium uppercase',
                    benchmarkStyles.text,
                  )}
                >
                  Threshold
                </span>
                {/* Status Badge */}
                {benchmarkAchieved ? (
                  <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-medium text-white'>
                    <Icon variant='check' className='h-3 w-3 stroke-white' />
                    Achieved
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-medium text-white'>
                    <Icon variant='closeX' className='h-3 w-3 stroke-white' />
                    Not Met
                  </span>
                )}
              </div>
              {/* Expand/Collapse chevron */}
              <Icon
                variant={isExpanded ? 'chevrondown' : 'chevronright'}
                className={cn('h-4 w-4', benchmarkStyles.icon)}
              />
            </div>
          </div>
          <div
            className={cn(
              'aucctus-text-xs leading-relaxed',
              benchmarkStyles.text,
            )}
          >
            {benchmark}
          </div>
        </div>
      </div>

      {/* Expanded Content - Findings Section */}
      {isExpanded && (
        <div className='aucctus-bg-secondary-subtle border-t'>
          <div className='p-4'>
            <div className='mb-3 flex items-center gap-2'>
              <span className='aucctus-text-sm-semibold aucctus-text-primary'>
                Findings
              </span>
              <span className='aucctus-bg-secondary aucctus-text-secondary flex h-5 items-center rounded-full px-1.5 text-xs font-semibold'>
                {findings.length}
              </span>
            </div>
            {findings.length > 0 ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {findings.map((finding) => (
                  <div
                    key={finding.id}
                    className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'
                  >
                    <h4 className='aucctus-text-md-medium aucctus-text-primary mb-2'>
                      {finding.title}
                    </h4>
                    <div>
                      <p className='aucctus-text-sm-medium aucctus-text-brand-primary mb-1'>
                        Impact
                      </p>
                      <p className='aucctus-text-sm aucctus-text-secondary'>
                        {finding.impact}
                      </p>
                    </div>
                    {finding.sources && finding.sources.length > 0 && (
                      <div className='mt-3'>
                        <SourceBadges
                          sources={finding.sources}
                          onSourceClick={onSourceClick}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className='aucctus-text-sm aucctus-text-secondary'>
                No findings recorded for this assumption.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssumptionResultCard;
