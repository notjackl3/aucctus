import React from 'react';
import { InsightCard as InsightCardType } from '../types';
import ManualAnswer from './ManualAnswer';
import PossibleAnswer from './PossibleAnswer';
import ResearchInsightCard from './ResearchInsightCard';

interface InsightCardProps {
  card: InsightCardType & { isManual?: boolean };
  isSelected: boolean;
  seedUuid: string;
  questionUuid: string;
  answer?: string;
  getSentimentColor: (
    sentiment: InsightCardType['sentiment'],
    source?: string,
  ) => string;
  getSentimentIcon: (
    sentiment: InsightCardType['sentiment'],
  ) => React.ReactNode;
  getSentimentDescription: (sentiment: InsightCardType['sentiment']) => string;
  onSelectionChange: (cardId: string, isSelected: boolean) => void;
  onDoubleClick: () => void;
  onDelete?: () => Promise<void>;
  onSubmit?: (answer: string) => Promise<void>;
  onAnimationComplete?: () => void;
}

/**
 * Router component that renders the appropriate card type based on the card's properties
 */
const InsightCard: React.FC<InsightCardProps> = ({
  card,
  isSelected,
  seedUuid,
  questionUuid,
  answer,
  getSentimentColor,
  getSentimentIcon,
  getSentimentDescription,
  onSelectionChange,
  onDoubleClick,
  onDelete,
  onSubmit,
  onAnimationComplete,
}) => {
  // Manual answer card (both input and saved variants)
  if (card.isManual) {
    return (
      <ManualAnswer
        answer={answer}
        onDelete={onDelete}
        onSubmit={onSubmit}
        onAnimationComplete={onAnimationComplete}
      />
    );
  }

  // Possible answer card (no double-click functionality)
  if (card.source === 'Possible Answer') {
    return (
      <PossibleAnswer
        card={card}
        isSelected={isSelected}
        seedUuid={seedUuid}
        questionUuid={questionUuid}
        getSentimentColor={getSentimentColor}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  // Research insight card (with double-click functionality and source links)
  return (
    <ResearchInsightCard
      card={card}
      isSelected={isSelected}
      seedUuid={seedUuid}
      questionUuid={questionUuid}
      getSentimentColor={getSentimentColor}
      getSentimentIcon={getSentimentIcon}
      getSentimentDescription={getSentimentDescription}
      onSelectionChange={onSelectionChange}
      onDoubleClick={onDoubleClick}
    />
  );
};

export default InsightCard;
