import React, { useState } from 'react';
import { Badge } from '@components';
import type { ISavedAnchorQuestion } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { InsightBadge } from './InsightBadge';
import { PossibleAnswerBadge, UserAnswerBadge } from './AnswerBadge';
import { ChevronDown } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface AnchorQuestionCardProps {
  question: ISavedAnchorQuestion;
  index: number;
}

/**
 * Question type configurations with colors and icons
 */
const questionTypeConfig: Record<
  string,
  {
    label: string;
    icon: string;
  }
> = {
  Audience: {
    label: 'Audience',
    icon: 'user-group',
  },
  Focus: {
    label: 'Focus',
    icon: 'target',
  },
  Problem: {
    label: 'Problem',
    icon: 'alert-circle',
  },
  'Usage context': {
    label: 'Usage Context',
    icon: 'compass-03',
  },
  WHY: {
    label: 'Why',
    icon: 'help-circle',
  },
  WHO: {
    label: 'Who',
    icon: 'user-group',
  },
  WHAT: {
    label: 'What',
    icon: 'lightbulb',
  },
  HOW: {
    label: 'How',
    icon: 'route',
  },
};

const defaultConfig = {
  label: 'Question',
  icon: 'help-circle' as string,
};

/**
 * AnchorQuestionCard - Expandable card for displaying a question with its content
 */
export const AnchorQuestionCard: React.FC<AnchorQuestionCardProps> = ({
  question,
  index,
}) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  const config = questionTypeConfig[question.questionType] || defaultConfig;

  const hasInsights = question.researchInsights?.length > 0;
  const hasPossibleAnswers = question.possibleAnswers?.length > 0;
  const hasUserAnswer = question.userAnswers?.length > 0;
  const hasContent = hasInsights || hasPossibleAnswers || hasUserAnswer;

  // Count total items
  const contentCount =
    (question.researchInsights?.length || 0) +
    (question.possibleAnswers?.length || 0) +
    (question.userAnswers?.length || 0);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border transition-all duration-200',
        'aucctus-bg-primary aucctus-border-secondary',
        {
          'shadow-md': isExpanded,
          'hover:shadow-sm': !isExpanded,
        },
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='hover:aucctus-bg-secondary flex w-full items-start gap-3 p-4 text-left transition-all duration-200'
      >
        {/* Question type icon */}
        <div
          className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200',
            'aucctus-bg-secondary',
            {
              'aucctus-bg-tertiary': isExpanded,
            },
          )}
        >
          <DynamicIcon
            variant={config.icon}
            className='aucctus-stroke-brand-primary'
            height={16}
            width={16}
          />
        </div>

        <div className='min-w-0 flex-1'>
          {/* Question type label + content count */}
          <div className='mb-2 flex items-center gap-2'>
            <span className='aucctus-text-xs-semibold aucctus-text-quaternary uppercase tracking-wide'>
              {config.label}
            </span>
            {hasContent && (
              <Badge.WithIcon className='aucctus-bg-secondary aucctus-border-tertiary aucctus-text-xs aucctus-text-tertiary'>
                {contentCount} {contentCount === 1 ? 'item' : 'items'}
              </Badge.WithIcon>
            )}
          </div>

          {/* Question text */}
          <h3 className='aucctus-text-md-semibold aucctus-text-primary leading-snug'>
            {question.question}
          </h3>

          {/* Description preview when collapsed */}
          {!isExpanded && question.description && (
            <p className='aucctus-text-sm aucctus-text-secondary mt-2 line-clamp-1'>
              {question.description}
            </p>
          )}
        </div>

        {/* Expand indicator */}
        <div
          className={cn(
            'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200',
            'aucctus-bg-secondary opacity-0 group-hover:opacity-100',
            {
              'rotate-180 opacity-100': isExpanded,
            },
          )}
        >
          <ChevronDown size={14} className='aucctus-stroke-brand-primary' />
        </div>
      </button>

      {/* Expanded content */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className='overflow-hidden'>
          <div className='aucctus-border-secondary border-t px-4 pb-4 pt-4'>
            {/* Description */}
            {question.description && (
              <p className='aucctus-text-sm aucctus-text-secondary mb-6 leading-relaxed'>
                {question.description}
              </p>
            )}

            {/* Content sections */}
            {hasContent ? (
              <div className='flex flex-col gap-6'>
                {/* User Answer */}
                {hasUserAnswer && (
                  <ContentSection
                    title={
                      question.userAnswers.length > 1
                        ? `Your Answers (${question.userAnswers.length})`
                        : 'Your Answer'
                    }
                    icon='check-circle-broken'
                  >
                    <div className='flex flex-col gap-2'>
                      {question.userAnswers.map((ua) => (
                        <UserAnswerBadge key={ua.uuid} answer={ua} />
                      ))}
                    </div>
                  </ContentSection>
                )}

                {/* Possible Answers */}
                {hasPossibleAnswers && (
                  <ContentSection
                    title={`Possible Answers (${question.possibleAnswers?.length})`}
                    icon='sparkles'
                  >
                    <div className='flex flex-col gap-2'>
                      {question.possibleAnswers?.map((answer) => (
                        <PossibleAnswerBadge
                          key={answer.uuid}
                          answer={answer}
                        />
                      ))}
                    </div>
                  </ContentSection>
                )}

                {/* Research Insights */}
                {hasInsights && (
                  <ContentSection
                    title={`Research Insights (${question.researchInsights?.length})`}
                    icon='search-refraction'
                  >
                    <div className='flex flex-col gap-2'>
                      {question.researchInsights?.map((insight) => (
                        <InsightBadge key={insight.uuid} insight={insight} />
                      ))}
                    </div>
                  </ContentSection>
                )}
              </div>
            ) : (
              <div className='flex items-center justify-center py-8'>
                <p className='aucctus-text-sm aucctus-text-tertiary italic'>
                  No answers or insights recorded
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ContentSection - Wrapper for content sections within a question card
 */
interface ContentSectionProps {
  title: string;
  icon: string;
  stroke?: string;
  children: React.ReactNode;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  icon,
  stroke = 'aucctus-stroke-brand-primary',
  children,
}) => (
  <div>
    <h4 className='aucctus-text-sm-semibold aucctus-text-secondary mb-3 flex items-center gap-2'>
      <DynamicIcon variant={icon} className={stroke} height={14} width={14} />
      {title}
    </h4>
    {children}
  </div>
);
