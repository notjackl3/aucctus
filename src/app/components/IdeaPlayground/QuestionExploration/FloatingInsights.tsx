import React, { useRef, useEffect } from 'react';
import { animated } from 'react-spring';
import type { InsightCard as InsightCardType } from '../types';
import type { IAnchorQuestion } from '@libs/api/types';
import { InsightCard } from '../Insights';
import {
  getSentimentColor,
  getSentimentIcon,
  getSentimentDescription,
  calculateCardPositions,
} from './utils';

interface FloatingInsightsProps {
  currentInsights: InsightCardType[];
  currentQuestion: { id: string };
  apiQuestions: IAnchorQuestion[];
  selectedInsights: Record<string, string[]>;
  seedUuid: string;
  elementRects: {
    leftNav?: DOMRect;
    rightNav?: DOMRect;
    questionCard?: DOMRect;
    container?: DOMRect;
  };
  onSelectionChange: (
    questionId: string,
    cardId: string,
    isSelected: boolean,
  ) => void;
  onInsightDoubleClick: (insight: InsightCardType) => void;
  onUserAnswerDelete: (questionId: string, card: any) => Promise<void>;
}

/**
 * Component for rendering floating insight cards around the question card
 */
const FloatingInsights: React.FC<FloatingInsightsProps> = ({
  currentInsights,
  currentQuestion,
  apiQuestions,
  selectedInsights,
  seedUuid,
  elementRects,
  onSelectionChange,
  onInsightDoubleClick,
  onUserAnswerDelete,
}) => {
  // Track previous card IDs for smooth animations
  const prevCardIdsRef = useRef<Set<string>>(new Set());

  // Reset card tracking when navigating to a different question
  useEffect(() => {
    prevCardIdsRef.current.clear();
  }, [currentQuestion?.id]);

  // Build limited insights array: nucleus first (if exists), then non-nucleus up to 3 more
  const limitedInsights = currentInsights.slice(0, 5);
  const allCards: any[] = [...limitedInsights];

  // Add possible answer cards if available (now supports multiple)
  const currentApiQuestion = apiQuestions.find(
    (q) => q.uuid === currentQuestion.id,
  );

  if (
    currentApiQuestion?.possibleAnswers &&
    !currentQuestion.id.startsWith('custom-')
  ) {
    currentApiQuestion.possibleAnswers.forEach((possibleAnswer) => {
      allCards.push({
        id: possibleAnswer.uuid,
        insight: possibleAnswer.answer,
        source: 'Possible Answer',
        type: 'data' as any,
        sentiment: 'neutral' as any,
        isManual: false,
        moreDetails: null,
        whyItMatters: null,
      });
    });
  }

  // Use a stable ID for both input and saved states to prevent re-animation
  const manualAnswerCardId = `manual-answer-${currentQuestion.id}`;

  // Add the saved user answer if it exists (only show saved answers, not input)
  if (
    currentApiQuestion?.userAnswer &&
    !currentQuestion.id.startsWith('custom-')
  ) {
    allCards.push({
      id: manualAnswerCardId, // Use stable ID instead of UUID
      insight: currentApiQuestion.userAnswer.answer,
      source: 'User Answer',
      type: 'manual' as any,
      sentiment: 'neutral' as any,
      isManual: true,
      isSaved: true, // Mark as saved to trigger API delete
      userAnswerUuid: currentApiQuestion.userAnswer.uuid, // Store UUID for deletion
    });
  }

  // Identify new cards vs existing cards for animation purposes
  const newCardIds = allCards
    .filter((card) => !prevCardIdsRef.current.has(card.id))
    .map((c) => c.id);

  // Update ref with current card IDs for next render
  prevCardIdsRef.current = new Set(allCards.map((c) => c.id));

  const transitionDuration = 400; // ms for existing cards to move

  return (
    <>
      {allCards.map((card, index) => {
        const { x, y } = calculateCardPositions(
          allCards.length,
          index,
          elementRects,
        );
        const isNewCard = newCardIds.includes(card.id);
        const entranceDelay = isNewCard ? transitionDuration + 50 : 0;

        return (
          <div
            key={card.id}
            className='pointer-events-auto absolute z-10 hover:z-50'
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              transition: isNewCard
                ? undefined
                : 'left 400ms ease-out, top 400ms ease-out',
            }}
          >
            <animated.div
              style={
                {
                  opacity: 0,
                  transform: `translate(${-x}px, ${-y}px) scale(0.5)`,
                  animation: `fadeSlideToPosition 300ms ease-out ${entranceDelay}ms forwards, float ${2.5 + (index % 3) * 0.5}s ease-in-out ${entranceDelay + 300}ms infinite`,
                  '--slide-x': `${-x}px`,
                  '--slide-y': `${-y}px`,
                } as React.CSSProperties
              }
            >
              <InsightCard
                card={card}
                isSelected={(
                  selectedInsights[currentQuestion.id] || []
                ).includes(card.id)}
                seedUuid={seedUuid}
                questionUuid={currentQuestion.id}
                answer={card.insight}
                getSentimentColor={getSentimentColor}
                getSentimentIcon={getSentimentIcon}
                getSentimentDescription={getSentimentDescription}
                onSelectionChange={(cardId, isSelected) =>
                  onSelectionChange(currentQuestion.id, cardId, isSelected)
                }
                onDoubleClick={() => onInsightDoubleClick(card)}
                onDelete={() => onUserAnswerDelete(currentQuestion.id, card)}
              />
            </animated.div>
          </div>
        );
      })}
    </>
  );
};

export default FloatingInsights;
