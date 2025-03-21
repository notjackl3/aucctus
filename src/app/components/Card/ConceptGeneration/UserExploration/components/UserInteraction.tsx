import React, { useMemo } from 'react';
import QuestionDisplay from './question/QuestionDisplay';
import LoadingMask from './util/LoadingMask';
import QuestionnaireHeader from './question/QuestionnaireHeader';
import AnswerInput from './answer/AnswerInput';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import { useTransition, animated } from 'react-spring';
import ConfirmAnswerUpdate from './answer/ConfirmAnswerUpdate';

import { useUserInteraction } from '../hooks/user-interaction-hook';
import { useConceptGenerationStore } from '@stores/concept-generation.store';
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

    setShowConfirmation,
    onInputChange,
    handleAddAnswer,
    handleGoBack,
    handleSubmitAnswer,
    doUpdateAnswer,
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
      from: { opacity: 0, transform: 'translateY(100px)', maxHeight: '0px' },
      enter: { opacity: 1, transform: 'translateY(0px)', maxHeight: '100px' },
      leave: { opacity: 0, transform: 'translateY(100px)', maxHeight: '0px' },
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
        onCancel={() => setShowConfirmation(false)}
        onConfirm={() => {
          doUpdateAnswer();
          setShowConfirmation(false);
        }}
      />
    </>
  );
};

export default UserInteraction;
