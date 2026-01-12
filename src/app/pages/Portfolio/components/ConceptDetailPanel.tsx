/**
 * Concept Detail Panel
 *
 * Shows detailed priority information for a selected concept from the matrix.
 */

import React from 'react';
import { Icon } from '@components';
import {
  getPriorityLevel,
  getPriorityColorClass,
} from '@libs/api/types/concept/concept_priority';
import { cn } from '@libs/utils/react';

import type { PrioritizedConcept } from '../PortfolioPrioritization';

interface ConceptDetailPanelProps {
  concept: PrioritizedConcept | null;
  allConcepts: PrioritizedConcept[];
  onConceptSelect: (conceptUuid: string) => void;
  onViewConcept: (conceptUuid: string) => void;
  onClose: () => void;
  isLoadingDetails?: boolean;
}

interface ScoreSectionProps {
  label: string;
  score: number;
  reasoning?: string;
  colorClass: string;
  isInverted?: boolean;
  isLoadingReasoning?: boolean;
}

const ScoreSection: React.FC<ScoreSectionProps> = ({
  label,
  score,
  reasoning,
  colorClass,
  isInverted = false,
  isLoadingReasoning = false,
}) => {
  // For risk, lower is better, so we invert the visual
  const displayScore = isInverted ? 100 - score : score;
  const scoreLabel = isInverted
    ? score <= 30
      ? 'Low'
      : score <= 60
        ? 'Medium'
        : 'High'
    : score >= 70
      ? 'High'
      : score >= 40
        ? 'Medium'
        : 'Low';

  return (
    <div className='aucctus-border-secondary space-y-3 border-b pb-4 last:border-b-0'>
      {/* Score Header */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <span className='aucctus-text-sm-medium aucctus-text-primary'>
            {label}
          </span>
          <div className='flex items-center gap-2'>
            <span className='aucctus-text-xs aucctus-text-tertiary'>
              {scoreLabel}
            </span>
            <span className={cn('aucctus-text-sm-bold', colorClass)}>
              {score}
            </span>
          </div>
        </div>
        <div className='aucctus-bg-tertiary h-2 w-full overflow-hidden rounded-full'>
          <div
            className={cn('h-full rounded-full transition-all duration-500', {
              'bg-green-500': displayScore >= 70,
              'bg-yellow-500': displayScore >= 40 && displayScore < 70,
              'bg-red-500': displayScore < 40,
            })}
            style={{ width: `${displayScore}%` }}
          />
        </div>
      </div>

      {/* Reasoning */}
      <div className='aucctus-bg-secondary rounded-md p-3'>
        {isLoadingReasoning ? (
          <div className='flex items-center gap-2'>
            <div className='aucctus-bg-tertiary h-3 w-3 animate-pulse rounded-full' />
            <span className='aucctus-text-xs aucctus-text-tertiary'>
              Loading reasoning...
            </span>
          </div>
        ) : reasoning ? (
          <p className='aucctus-text-xs aucctus-text-secondary leading-relaxed'>
            {reasoning}
          </p>
        ) : (
          <p className='aucctus-text-xs aucctus-text-quaternary italic'>
            No reasoning available
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Concept Card Component
 * Displays a concept with opportunity/risk bars and overall score badge
 */
interface ConceptCardProps {
  concept: PrioritizedConcept;
  onSelect: (conceptUuid: string) => void;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ concept, onSelect }) => {
  const priorityLevel = getPriorityLevel(concept.overallPriorityScore);

  return (
    <button
      onClick={() => onSelect(concept.conceptUuid)}
      className='aucctus-bg-primary-hover aucctus-border-secondary flex w-full items-center gap-4 border-b px-4 py-5 text-left transition-colors last:border-b-0'
    >
      {/* Left content - Title and bars */}
      <div className='min-w-0 flex-1'>
        <h4 className='aucctus-text-md-semibold aucctus-text-primary mb-3'>
          {concept.title}
        </h4>
        <div className='flex flex-col gap-2'>
          {/* Strategic Alignment Row */}
          <div className='flex items-center gap-3'>
            <span className='aucctus-text-sm aucctus-text-tertiary w-24 shrink-0'>
              Strategic
            </span>
            <div className='aucctus-bg-tertiary h-2.5 flex-1 overflow-hidden rounded-full'>
              <div
                className='h-full rounded-full bg-blue-500 transition-all duration-300'
                style={{
                  width: `${concept.strategicAlignmentScore}%`,
                }}
              />
            </div>
            <span className='aucctus-text-sm aucctus-text-primary w-8 shrink-0 text-right'>
              {concept.strategicAlignmentScore}
            </span>
          </div>
          {/* Opportunity Row */}
          <div className='flex items-center gap-3'>
            <span className='aucctus-text-sm aucctus-text-tertiary w-24 shrink-0'>
              Opportunity
            </span>
            <div className='aucctus-bg-tertiary h-2.5 flex-1 overflow-hidden rounded-full'>
              <div
                className='h-full rounded-full bg-green-500 transition-all duration-300'
                style={{
                  width: `${concept.financialOpportunityScore}%`,
                }}
              />
            </div>
            <span className='aucctus-text-sm aucctus-text-primary w-8 shrink-0 text-right'>
              {concept.financialOpportunityScore}
            </span>
          </div>
          {/* Risk Row */}
          <div className='flex items-center gap-3'>
            <span className='aucctus-text-sm aucctus-text-tertiary w-24 shrink-0'>
              Risk
            </span>
            <div className='aucctus-bg-tertiary h-2.5 flex-1 overflow-hidden rounded-full'>
              <div
                className='h-full rounded-full bg-red-500 transition-all duration-300'
                style={{
                  width: `${concept.innovationRiskScore}%`,
                }}
              />
            </div>
            <span className='aucctus-text-sm aucctus-text-primary w-8 shrink-0 text-right'>
              {concept.innovationRiskScore}
            </span>
          </div>
        </div>
      </div>

      {/* Right - Overall Score Badge */}
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-full',
          priorityLevel === 'high'
            ? 'bg-green-500'
            : priorityLevel === 'medium'
              ? 'bg-yellow-500'
              : 'bg-red-500',
        )}
      >
        <span className='text-xl font-bold text-white'>
          {concept.overallPriorityScore}
        </span>
      </div>
    </button>
  );
};

const ConceptDetailPanel: React.FC<ConceptDetailPanelProps> = ({
  concept,
  allConcepts,
  onConceptSelect,
  onViewConcept,
  onClose,
  isLoadingDetails = false,
}) => {
  if (!concept) {
    // Sort concepts by overall priority score (descending)
    const sortedConcepts = [...allConcepts].sort(
      (a, b) => b.overallPriorityScore - a.overallPriorityScore,
    );

    return (
      <div className='aucctus-bg-primary aucctus-border-secondary flex max-h-[600px] flex-col rounded-lg border shadow-sm'>
        {/* Header */}
        <div className='aucctus-border-secondary border-b px-5 py-4'>
          <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
            All Concepts
          </h3>
        </div>

        {/* Content */}
        {sortedConcepts.length === 0 ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center'>
            <Icon
              variant='layers'
              height={48}
              width={48}
              className='aucctus-stroke-tertiary'
            />
            <div>
              <h3 className='aucctus-text-md-semibold aucctus-text-primary mb-2'>
                No Concepts
              </h3>
              <p className='aucctus-text-sm aucctus-text-secondary'>
                No prioritized concepts available.
              </p>
            </div>
          </div>
        ) : (
          <div className='flex-1 overflow-y-auto'>
            {sortedConcepts.map((conceptItem) => (
              <ConceptCard
                key={conceptItem.conceptUuid}
                concept={conceptItem}
                onSelect={onConceptSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const priorityLevel = getPriorityLevel(concept.overallPriorityScore);
  const priorityColors = getPriorityColorClass(priorityLevel);

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex max-h-[600px] flex-col rounded-lg border shadow-sm'>
      {/* Header */}
      <div className='aucctus-border-secondary flex items-start justify-between gap-3 border-b px-5 py-4'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
          {concept.title}
        </h3>
        <button
          onClick={onClose}
          className='aucctus-bg-secondary-hover shrink-0 rounded p-1'
          aria-label='Close'
        >
          <Icon
            variant='closeX'
            height={16}
            width={16}
            className='aucctus-stroke-tertiary'
          />
        </button>
      </div>

      {/* Overall Priority Score */}
      <div className='aucctus-border-secondary border-b px-5 py-3'>
        <div className='flex items-center justify-between'>
          <span className='aucctus-text-sm aucctus-text-secondary'>
            Overall Priority
          </span>
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-3 py-1',
              priorityColors.bg,
            )}
          >
            <span className={cn('aucctus-text-lg-bold', priorityColors.text)}>
              {concept.overallPriorityScore}
            </span>
            <span className={cn('aucctus-text-xs-medium', priorityColors.text)}>
              / 100
            </span>
          </div>
        </div>
      </div>

      {/* Score Breakdown with Reasoning - Scrollable */}
      <div className='flex-1 space-y-4 overflow-y-auto p-4'>
        <ScoreSection
          label='Strategic Alignment'
          score={concept.strategicAlignmentScore}
          reasoning={concept.strategicAlignmentReasoning}
          colorClass='aucctus-text-brand-primary'
          isLoadingReasoning={isLoadingDetails}
        />

        <ScoreSection
          label='Financial Opportunity'
          score={concept.financialOpportunityScore}
          reasoning={concept.financialOpportunityReasoning}
          colorClass='aucctus-text-success-primary'
          isLoadingReasoning={isLoadingDetails}
        />

        <ScoreSection
          label='Innovation Risk'
          score={concept.innovationRiskScore}
          reasoning={concept.innovationRiskReasoning}
          colorClass='aucctus-text-error-primary'
          isInverted={true}
          isLoadingReasoning={isLoadingDetails}
        />
      </div>

      {/* Footer */}
      <div className='aucctus-border-secondary border-t px-5 py-4'>
        <button
          onClick={() => onViewConcept(concept.identifier)}
          className='aucctus-bg-brand-solid hover:aucctus-bg-brand-solid-hover flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors'
        >
          <Icon
            variant='arrowright'
            height={16}
            width={16}
            className='stroke-white'
          />
          View Concept Details
        </button>
        <p className='aucctus-text-xs aucctus-text-quaternary mt-2 text-center'>
          Last updated:{' '}
          {new Date(concept.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
};

export default ConceptDetailPanel;
