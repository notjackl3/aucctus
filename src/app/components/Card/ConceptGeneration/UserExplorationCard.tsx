import { cn } from '@libs/utils/react';
import React from 'react';
import GenerateNewIdeas from './UserExploration/components/GenerateNewIdeas';
import UserInteraction from './UserExploration/components/UserInteraction';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
interface UserExplorationCardProps {
  className?: string;
}

const UserExplorationCard: React.FC<UserExplorationCardProps> = ({
  className = '',
}) => {
  const { currentQuestionOrder } = useConceptIncubationStore();

  const renderActiveCard = React.useCallback(() => {
    if (currentQuestionOrder === undefined) {
      return <GenerateNewIdeas />;
    }

    return <UserInteraction />;
  }, [currentQuestionOrder]);

  return (
    <div className={cn('flex flex-col rounded-xl', className)}>
      {renderActiveCard()}
    </div>
  );
};

export default UserExplorationCard;
