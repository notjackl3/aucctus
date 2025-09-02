import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, { useMemo } from 'react';
import { animated, useTransition } from 'react-spring';
import AnswerInput from './answer/AnswerInput';
import ConfirmAnswerUpdate from './answer/ConfirmAnswerUpdate';
import QuestionDisplay from './question/QuestionDisplay';
import QuestionnaireHeader from './question/QuestionnaireHeader';
import LoadingMask from './util/LoadingMask';

import { useConceptGenerationStore } from '@stores/concept-generation.store';
import { useUserInteraction } from '../hooks/user-interaction-hook';
import PostGenerateQuestionDisplay from './question/PostGenerateQuestionDisplay';

// Types
interface UserInteractionProps {}

// Main component
const UserInteraction: React.FC<UserInteractionProps> = () => {
  const {
    answerValue,
    showConfirmation,
    isLoading,
    loadingMessage,
    activeQuestionnaire,
    activeQuestion,
    currentQuestionOrder,
    isQuestionAnswered,
    allowAddAnswer,
    activeAnswer,
    seedDraftData,

    setShowConfirmation,
    onInputChange,
    handleAddAnswer,
    handleGoBack,
    handleSubmitAnswer,
    doUpdateAnswer,
    doConfirmAnswer,
    doRevertAnswer,
    dispatchAiSuggestionsEvent,
  } = useUserInteraction();

  const { generatedConcepts } = useConceptGenerationStore();

  const { activeClarifyingQuestion, draftSeedUuid } =
    useConceptIncubationStore();

  const currentGeneratedConcepts = useMemo(() => {
    return generatedConcepts[draftSeedUuid] || [];
  }, [generatedConcepts, draftSeedUuid]);

  // Add transition for answer input
  const answerInputTransition = useTransition(
    currentQuestionOrder !== Infinity || activeClarifyingQuestion,
    {
      from: { opacity: 0, transform: 'translateY(100px)' },
      enter: { opacity: 1, transform: 'translateY(0px)' },
      leave: { opacity: 0, transform: 'translateY(100px)' },
      config: { tension: 200, friction: 20, mass: 0.5 },
    },
  );

  return (
    <>
      <div className='relative flex flex-1 animate-slide-in-center flex-col'>
        <QuestionnaireHeader
          questionnaire={activeQuestionnaire}
          onGoBack={handleGoBack}
          onContinue={handleSubmitAnswer}
          isQuestionAnswered={isQuestionAnswered}
          isRequired={activeQuestion?.required ?? false}
        />
        <div className='z-[10] my-4 flex flex-1 transition-all duration-300'>
          {currentGeneratedConcepts?.length <= 0 ? (
            <QuestionDisplay />
          ) : (
            <PostGenerateQuestionDisplay />
          )}
        </div>
        {answerInputTransition(
          (style, item) =>
            item && (
              <animated.div style={style}>
                <AnswerInput
                  value={answerValue}
                  onChange={onInputChange}
                  onAddAnswer={handleAddAnswer}
                  allowAddAnswer={allowAddAnswer}
                  onGenerateAiSuggestions={dispatchAiSuggestionsEvent}
                />
              </animated.div>
            ),
        )}
      </div>
      <LoadingMask isLoading={isLoading} message={loadingMessage} />
      <ConfirmAnswerUpdate
        show={showConfirmation}
        onCancel={() => {
          doRevertAnswer();
          setShowConfirmation(false);
        }}
        onConfirm={() => {
          // For cloned seeds showing preservation warning, preserve answers when user confirms
          // For other scenarios, use the regular confirm flow
          if (seedDraftData?.isCloned === true && activeAnswer) {
            doUpdateAnswer(false);
          } else {
            doConfirmAnswer();
          }
          setShowConfirmation(false);
        }}
        isClarifyingQuestion={!!activeClarifyingQuestion}
      />
    </>
  );
};

export default UserInteraction;
