import { cn } from '@libs/utils/react';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React from 'react';
import GenerateNewIdeas from './UserExploration/components/GenerateNewIdeas';
import UserInteraction from './UserExploration/components/UserInteraction';

interface UserExplorationCardProps {
  className?: string;
}

const UserExplorationCard = React.forwardRef<
  HTMLDivElement,
  UserExplorationCardProps
>(({ className = '' }, ref) => {
  const { currentQuestionOrder } = useConceptIncubationStore();

  const renderActiveCard = React.useCallback(() => {
    if (!currentQuestionOrder) {
      return <GenerateNewIdeas />;
    }

    return <UserInteraction />;
  }, [currentQuestionOrder]);

  return (
    <div ref={ref} className={cn('flex flex-col rounded-xl', className)}>
      {renderActiveCard()}
    </div>
  );
});

UserExplorationCard.displayName = 'UserExplorationCard';

export default UserExplorationCard;
