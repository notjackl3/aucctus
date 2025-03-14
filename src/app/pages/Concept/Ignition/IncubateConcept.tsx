import React, { useCallback, useEffect, useRef } from 'react';
import { Card, Loading } from '@components';
import {
  useConceptIgnitionQuestionnaire,
  useConceptSeedDraft,
  useDeleteConceptSeedDraft,
} from '@hooks/query/concepts.hook';
import {
  ExpandAnExistingIdeaQuestions,
  IConceptIgnitionQuestionnaireSection,
  IdentifyNewOpportunitiesQuestions,
} from '@libs/api/types/conceptSeedQuestionnaire';
import { cn } from '@libs/utils/react';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';

interface IncubateConceptProps {
  initialDraftSeedUuid?: string;
}

export type QuestionnaireSection =
  | IConceptIgnitionQuestionnaireSection<ExpandAnExistingIdeaQuestions>
  | IConceptIgnitionQuestionnaireSection<IdentifyNewOpportunitiesQuestions>;

const IncubateConcept: React.FC<IncubateConceptProps> = ({
  initialDraftSeedUuid,
}) => {
  const { isLoading: isSeedLoading } =
    useConceptSeedDraft(initialDraftSeedUuid);
  const { isLoading: isQuestionnaireLoading } =
    useConceptIgnitionQuestionnaire();
  const { mutate: deleteDraft } = useDeleteConceptSeedDraft();

  const {
    currentQuestionOrder,
    draftSeedUuid,
    submittedAnswers,
    resetQuestionnaire,
  } = useConceptIncubationStore();

  // Refs to store latest values
  const latestValuesRef = useRef({
    draftSeedUuid,
    submittedAnswers,
    deleteDraft,
    resetQuestionnaire,
  });

  // Update refs whenever values change
  useEffect(() => {
    latestValuesRef.current = {
      draftSeedUuid,
      submittedAnswers,
      deleteDraft,
      resetQuestionnaire,
    };
  }, [draftSeedUuid, submittedAnswers, deleteDraft, resetQuestionnaire]);

  const deleteAnswerlessDraft = useCallback(() => {
    const { draftSeedUuid, submittedAnswers, deleteDraft, resetQuestionnaire } =
      latestValuesRef.current;

    if (submittedAnswers.length === 0 && draftSeedUuid) {
      deleteDraft(draftSeedUuid, {
        onSuccess: () => resetQuestionnaire(),
        onError: (error) => {
          console.error('Failed to delete draft: ', error);
          resetQuestionnaire();
        },
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', deleteAnswerlessDraft);

    return () =>
      window.removeEventListener('beforeunload', deleteAnswerlessDraft);
  }, [deleteAnswerlessDraft]);

  useEffect(() => {
    return () => deleteAnswerlessDraft();
  }, [deleteAnswerlessDraft]);

  if (isSeedLoading || isQuestionnaireLoading) {
    return <Loading />;
  }

  return (
    <div className='flex h-[100vh] flex-row gap-4 p-8'>
      <Card.UserExplorationCard className='ease h-full flex-1 p-4 transition-all duration-300' />
      <Card.AiExplorationsCard
        className={cn('ease h-full w-[50%] p-4 transition-all duration-300', {
          'w-[35%]': currentQuestionOrder !== undefined,
        })}
      />
    </div>
  );
};

export default IncubateConcept;
