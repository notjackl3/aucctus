import { cn } from '@libs/utils/react';
import { snakeToTitleCase } from '@libs/utils/string';
import { getBaseUrl, getLogoUrl } from '@libs/utils/source';
import images from '@assets/img';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import type {
  IConceptSeedAnswer,
  ConceptIncubationQuestion,
  IClarifyingQuestion,
  IConceptSeed,
  IAnchorThoughtWithQuestions,
  ISavedAnchorQuestion,
  ISavedResearchInsight,
  ISavedPossibleAnswer,
  ISavedUserAnswer,
} from '@libs/api/types';

// ── Types ──────────────────────────────────────────────

interface ParsedWatchtowerData {
  context: string;
  signalBasis?: string;
  potentialImpact?: string;
  urgency?: string;
}

interface CardData {
  id: string;
  label: string;
  body: string;
  footer?: string;
  insights?: InsightItem[];
}

type InsightItem =
  | { kind: 'research'; data: ISavedResearchInsight }
  | { kind: 'possible'; data: ISavedPossibleAnswer }
  | { kind: 'user'; data: ISavedUserAnswer };

interface SeedInputCardGridProps {
  seedDraft: IConceptSeed;
  ignitionQuestions: IConceptSeedAnswer[];
  clarifyingQuestions: Array<{
    question: IClarifyingQuestion;
    answer?: IConceptSeedAnswer;
  }>;
  isWatchtowerSeed: boolean;
  isEmployeeSubmissionSeed: boolean;
  isIdeaPlaygroundSeed: boolean;
  parsedWatchtowerData: ParsedWatchtowerData | null;
  formatAnswer: (
    answer: IConceptSeedAnswer,
    question: ConceptIncubationQuestion,
  ) => string;
}

// ── Helpers ────────────────────────────────────────────

const getSourceInitial = (source: string): string => {
  return source.replace('.com', '').charAt(0).toUpperCase();
};

const collectInsights = (q: ISavedAnchorQuestion): InsightItem[] => {
  const items: InsightItem[] = [];
  q.possibleAnswers?.forEach((pa) =>
    items.push({ kind: 'possible', data: pa }),
  );
  q.researchInsights?.forEach((ri) =>
    items.push({ kind: 'research', data: ri }),
  );
  q.userAnswers?.forEach((ua) => items.push({ kind: 'user', data: ua }));
  return items;
};

// ── Insight Bubble ─────────────────────────────────────

const InsightBubble: React.FC<{ item: InsightItem; index: number }> = ({
  item,
  index,
}) => {
  const isPossibleAnswer = item.kind === 'possible';
  const isUserAnswer = item.kind === 'user';

  const text =
    item.kind === 'research'
      ? item.data.insight
      : item.kind === 'possible'
        ? item.data.answer
        : item.data.answer;

  return (
    <motion.div
      className={cn(
        'flex w-[200px] flex-shrink-0 cursor-default select-none flex-col gap-2 rounded-xl border p-3',
        isPossibleAnswer
          ? 'border-amber-200/60 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/20'
          : 'aucctus-bg-secondary aucctus-border-secondary',
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
    >
      <p className='aucctus-text-primary line-clamp-4 flex-1 text-[13px] font-semibold leading-snug'>
        {text}
      </p>

      <div className='mt-auto'>
        {isPossibleAnswer ? (
          <span className='inline-flex items-center rounded-full border border-amber-200/60 bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:border-amber-700/40 dark:bg-amber-900/30 dark:text-amber-400'>
            Possible Answer
          </span>
        ) : isUserAnswer ? (
          <span className='aucctus-bg-tertiary aucctus-border-secondary aucctus-text-tertiary inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium'>
            Your Answer
          </span>
        ) : item.kind === 'research' ? (
          <SourceBadge insight={item.data} />
        ) : null}
      </div>
    </motion.div>
  );
};

const SourceBadge: React.FC<{ insight: ISavedResearchInsight }> = ({
  insight,
}) => {
  const sourceUrl = insight.source?.url;
  const sourceTitle = insight.source?.title;
  const baseUrl = sourceUrl ? getBaseUrl(sourceUrl) : null;
  const displayName = sourceTitle || baseUrl || 'Source';
  const truncated =
    displayName.length > 15 ? `${displayName.slice(0, 15)}...` : displayName;

  return (
    <div className='aucctus-border-secondary aucctus-bg-secondary inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]'>
      <div
        className={cn(
          'flex h-3 w-3 items-center justify-center overflow-hidden rounded-full',
          baseUrl ? '' : 'aucctus-bg-tertiary',
        )}
      >
        {baseUrl ? (
          <img
            className='h-full w-full object-contain'
            alt='src'
            src={getLogoUrl(baseUrl)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = images.link;
            }}
          />
        ) : (
          <span className='text-[5px] font-bold text-white'>
            {getSourceInitial(displayName)}
          </span>
        )}
      </div>
      <span className='aucctus-text-tertiary max-w-[60px] truncate font-medium'>
        {truncated}
      </span>
    </div>
  );
};

// ── Card Component ─────────────────────────────────────

const InputCard: React.FC<{
  card: CardData;
  index: number;
  expandedId: string | null;
  onToggle: (id: string) => void;
}> = ({ card, index, expandedId, onToggle }) => {
  const isExpanded = expandedId === card.id;
  const hasInsights = card.insights && card.insights.length > 0;

  return (
    <motion.div
      className='aucctus-bg-primary aucctus-border-secondary flex flex-col overflow-hidden rounded-xl border'
      layout
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: index * 0.06,
      }}
      style={{ gridColumn: isExpanded ? 'span 2' : 'span 1' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Body */}
      <div className='min-h-[140px] flex-1 px-4 pb-3 pt-4'>
        <p className='aucctus-text-xs-semibold aucctus-text-tertiary mb-2 uppercase tracking-widest'>
          {card.label}
        </p>
        <p
          className={cn(
            'aucctus-text-primary text-sm font-medium leading-snug',
            !isExpanded && hasInsights ? 'line-clamp-3' : '',
            !hasInsights ? 'line-clamp-5' : '',
          )}
        >
          {card.body}
        </p>
      </div>

      {/* Footer */}
      <AnimatePresence mode='wait'>
        {hasInsights && !isExpanded ? (
          <motion.button
            key='collapsed'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => onToggle(card.id)}
            className='aucctus-border-secondary mt-auto flex items-center justify-between border-t px-4 py-2.5 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
          >
            <span className='aucctus-text-tertiary text-xs font-semibold'>
              {card.insights!.length} insight
              {card.insights!.length !== 1 ? 's' : ''}
            </span>
            <div className='aucctus-border-secondary aucctus-bg-secondary flex h-7 w-7 items-center justify-center rounded-full border transition-colors'>
              <ChevronRight className='aucctus-text-tertiary h-3.5 w-3.5' />
            </div>
          </motion.button>
        ) : hasInsights && isExpanded ? (
          <motion.div
            key='expanded'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className='aucctus-border-secondary border-t'
          >
            <div className='flex gap-2 overflow-x-auto px-3 py-3'>
              {card.insights!.map((item, i) => (
                <InsightBubble key={item.data.uuid} item={item} index={i} />
              ))}
            </div>
            <div className='flex justify-end px-4 pb-3'>
              <button
                onClick={() => onToggle(card.id)}
                className='aucctus-border-secondary aucctus-bg-secondary aucctus-bg-tertiary-hover flex h-7 w-7 items-center justify-center rounded-full border transition-colors'
              >
                <ChevronRight className='aucctus-text-tertiary h-3.5 w-3.5 rotate-180' />
              </button>
            </div>
          </motion.div>
        ) : card.footer ? (
          <div className='aucctus-border-secondary mt-auto border-t px-4 py-2.5'>
            <span className='aucctus-text-tertiary line-clamp-2 text-xs'>
              {card.footer}
            </span>
          </div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────

const SeedInputCardGrid: React.FC<SeedInputCardGridProps> = ({
  seedDraft,
  ignitionQuestions,
  clarifyingQuestions,
  isWatchtowerSeed,
  isEmployeeSubmissionSeed,
  isIdeaPlaygroundSeed,
  parsedWatchtowerData,
  formatAnswer,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const toggleQuestion = useCallback((id: string) => {
    setExpandedQuestion((prev) => (prev === id ? null : id));
  }, []);

  const cards = useMemo((): CardData[] => {
    // Idea Playground
    if (isIdeaPlaygroundSeed && seedDraft.anchorThought) {
      const at = seedDraft.anchorThought as IAnchorThoughtWithQuestions;
      const startingInput: CardData = {
        id: 'starting-input',
        label: 'Starting Input',
        body: at.thought,
        footer: 'Idea Playground',
      };
      const questionCards: CardData[] = (at.questions || []).map((q, i) => ({
        id: q.uuid,
        label: `Question ${i + 1}`,
        body: q.question,
        insights: collectInsights(q),
      }));
      return [startingInput, ...questionCards];
    }

    // Watchtower
    if (isWatchtowerSeed && parsedWatchtowerData) {
      const cards: CardData[] = [
        {
          id: 'starting-input',
          label: 'Starting Input',
          body: parsedWatchtowerData.context || seedDraft.description || '',
          footer: 'Watchtower Signal',
        },
      ];
      if (parsedWatchtowerData.signalBasis) {
        cards.push({
          id: 'signal-basis',
          label: 'Signal Basis',
          body: parsedWatchtowerData.signalBasis,
        });
      }
      if (parsedWatchtowerData.potentialImpact) {
        cards.push({
          id: 'potential-impact',
          label: 'Potential Impact',
          body: parsedWatchtowerData.potentialImpact,
        });
      }
      if (parsedWatchtowerData.urgency) {
        cards.push({
          id: 'urgency',
          label: 'Urgency',
          body: parsedWatchtowerData.urgency,
        });
      }
      return cards;
    }

    // Employee Submission
    if (isEmployeeSubmissionSeed && seedDraft.ideaSubmissions?.length) {
      const sub = seedDraft.ideaSubmissions[0];
      return [
        {
          id: 'idea-description',
          label: 'Idea Description',
          body: sub.title || '',
        },
        {
          id: 'problem-statement',
          label: 'Problem Statement',
          body: sub.problemStatement || '',
        },
        {
          id: 'proposed-solution',
          label: 'Proposed Solution',
          body: sub.proposedSolution || '',
        },
        {
          id: 'expected-impact',
          label: 'Expected Impact',
          body: sub.expectedImpact || '',
        },
      ];
    }

    // Regular seeds
    const result: CardData[] = [
      {
        id: 'starting-input',
        label: 'Starting Input',
        body: seedDraft.description || seedDraft.title || '',
        footer: snakeToTitleCase(seedDraft.type),
      },
    ];

    ignitionQuestions.forEach((answer, i) => {
      result.push({
        id: `q-${answer.question.id}`,
        label: `Question ${i + 1}`,
        body: answer.question.label,
        footer: formatAnswer(answer, answer.question) || undefined,
      });
    });

    clarifyingQuestions.forEach(({ question, answer }, i) => {
      result.push({
        id: `cq-${question.uuid}`,
        label: `Follow-up ${i + 1}`,
        body: question.question.label,
        footer: answer ? formatAnswer(answer, answer.question) : undefined,
      });
    });

    return result;
  }, [
    seedDraft,
    isIdeaPlaygroundSeed,
    isWatchtowerSeed,
    isEmployeeSubmissionSeed,
    parsedWatchtowerData,
    ignitionQuestions,
    clarifyingQuestions,
    formatAnswer,
  ]);

  if (cards.length === 0) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='aucctus-text-secondary aucctus-text-md'>
          No seed information available
        </p>
      </div>
    );
  }

  return (
    <div
      className='grid grid-cols-2 gap-3 lg:grid-cols-3'
      style={{ gridAutoRows: '1fr' }}
    >
      {cards.map((card, index) => (
        <InputCard
          key={card.id}
          card={card}
          index={index}
          expandedId={expandedQuestion}
          onToggle={toggleQuestion}
        />
      ))}
    </div>
  );
};

export default SeedInputCardGrid;
