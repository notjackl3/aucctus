import React, { useMemo } from 'react';
import type { IAnchorThoughtWithQuestions } from '@libs/api/types';
import { AnchorQuestionCard } from './AnchorQuestionCard';
import { cn } from '@libs/utils/react';
import { Compass, Lightbulb } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface IdeaPlaygroundSeedDisplayProps {
  anchorThought: IAnchorThoughtWithQuestions;
}

/**
 * Animation helper - creates staggered fade-in animations
 */
const getStaggeredAnimation = (index: number, baseDelay: number = 0) => ({
  opacity: 0,
  animation: `fadeSlideUp 0.4s ease-out forwards`,
  animationDelay: `${baseDelay + index * 60}ms`,
});

/**
 * IdeaPlaygroundSeedDisplay - Main component for displaying saved Idea Playground seed data
 *
 * Renders the anchor thought and all associated questions with their insights and answers
 * in a clean, animated format for the Concept Settings page.
 */
export const IdeaPlaygroundSeedDisplay: React.FC<
  IdeaPlaygroundSeedDisplayProps
> = ({ anchorThought }) => {
  const hasQuestions = anchorThought.questions?.length > 0;

  // Calculate stats for summary
  const stats = useMemo(() => {
    const totalQuestions = anchorThought.questions?.length || 0;
    const questionsWithContent =
      anchorThought.questions?.filter(
        (q) =>
          (q.userAnswers && q.userAnswers.length > 0) ||
          (q.possibleAnswers && q.possibleAnswers.length > 0) ||
          (q.researchInsights && q.researchInsights.length > 0) ||
          (q.fileInsights && q.fileInsights.length > 0),
      ).length || 0;
    const totalInsights =
      anchorThought.questions?.reduce(
        (sum, q) =>
          sum +
          (q.researchInsights?.length || 0) +
          (q.fileInsights?.length || 0),
        0,
      ) || 0;
    const totalAnswers =
      anchorThought.questions?.reduce(
        (sum, q) =>
          sum + (q.possibleAnswers?.length || 0) + (q.userAnswers?.length || 0),
        0,
      ) || 0;

    return {
      totalQuestions,
      questionsWithContent,
      totalInsights,
      totalAnswers,
    };
  }, [anchorThought.questions]);

  return (
    <div className='flex flex-col gap-8'>
      {/* Inline keyframes */}
      <style>
        {`
          @keyframes fadeSlideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      {/* Anchor Thought Hero Section */}
      <div style={getStaggeredAnimation(0, 100)}>
        <div
          className={cn(
            'relative overflow-hidden rounded-lg',
            'aucctus-bg-primary aucctus-border-secondary',
            'border p-6 transition-all duration-200',
            'hover:shadow-md',
          )}
        >
          <div className='relative z-10 flex items-start gap-4'>
            {/* Icon container */}
            <div
              className={cn(
                'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg',
                'aucctus-bg-brand-primary hover:aucctus-bg-brand-primary-hover transition-all duration-200',
              )}
            >
              <Lightbulb size={24} className='aucctus-stroke-brand-primary' />
            </div>

            <div className='flex-1'>
              {/* Label */}
              <span className='aucctus-text-xs-semibold aucctus-text-tertiary mb-2 inline-block uppercase tracking-wider'>
                Anchor Thought
              </span>

              {/* Thought text */}
              <p className='aucctus-text-lg-medium aucctus-text-primary leading-relaxed'>
                {anchorThought.thought}
              </p>

              {/* Stats row */}
              <div className='mt-4 flex flex-wrap items-center gap-4'>
                <StatBadge
                  icon='help-circle'
                  value={stats.totalQuestions}
                  label='questions'
                />
                <StatBadge
                  icon='search-refraction'
                  value={stats.totalInsights}
                  label='insights'
                />
                <StatBadge
                  icon='sparkles'
                  value={stats.totalAnswers}
                  label='answers'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      {hasQuestions && (
        <div className='flex flex-col gap-4'>
          {/* Section header */}
          <div
            className='flex items-center gap-3'
            style={getStaggeredAnimation(1, 200)}
          >
            <div className='aucctus-bg-secondary flex h-9 w-9 items-center justify-center rounded-lg'>
              <Compass className='aucctus-stroke-brand-primary' />
            </div>
            <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
              Exploration Journey
            </h2>
          </div>

          {/* Questions list */}
          <div className='flex flex-col gap-3'>
            {anchorThought.questions.map((question, index) => (
              <div
                key={question.uuid}
                style={getStaggeredAnimation(index + 2, 300)}
              >
                <AnchorQuestionCard question={question} index={index} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasQuestions && (
        <div
          className='flex flex-col items-center justify-center py-12'
          style={getStaggeredAnimation(1, 200)}
        >
          <div className='aucctus-bg-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
            <Compass size={24} className='aucctus-stroke-tertiary' />
          </div>
          <p className='aucctus-text-secondary aucctus-text-md text-center'>
            No exploration questions recorded for this seed
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * StatBadge - Small stat indicator component
 */
interface StatBadgeProps {
  icon: string;
  value: number;
  label: string;
}

const StatBadge: React.FC<StatBadgeProps> = ({ icon, value, label }) => {
  return (
    <div className='flex items-center gap-2'>
      <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200',
          'aucctus-bg-secondary hover:aucctus-bg-tertiary',
        )}
      >
        <DynamicIcon
          variant={icon}
          className='aucctus-stroke-tertiary'
          height={14}
          width={14}
        />
      </div>
      <span className='aucctus-text-sm-semibold aucctus-text-primary'>
        {value}
      </span>
      <span className='aucctus-text-sm aucctus-text-tertiary'>{label}</span>
    </div>
  );
};
