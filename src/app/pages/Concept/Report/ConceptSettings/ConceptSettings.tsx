import { toast, ConceptReportSkeletons } from '@components';
import { useSeed } from '@hooks/query/concepts.hook';
import {
  ConceptIncubationQuestion,
  IConceptSeedAnswer,
  IAnchorThoughtWithQuestions,
} from '@libs/api/types';
import { isMultiSelectQuestion } from '@libs/api/utils/typeGuards';
import { snakeToTitleCase } from '@libs/utils/string';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';
import { ClarifyingQuestion } from './components/ClarifyingQuestion';
import { IgnitionQuestion } from './components/IgnitionQuestion';
import { IdeaPlaygroundSeedDisplay } from './components/IdeaPlaygroundSeedDisplay';
import { useClarifyingQuestionsWithAnswers } from '@hooks/concepts/clarifying-questions.hook';
import { useCloneSeed } from '@hooks/query/concepts.hook';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '@routes/routes';
import utils from '@libs/utils';

import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';

/**
 * Type guard to check if anchor thought has nested questions (IDEA_PLAYGROUND seed)
 */
const isIdeaPlaygroundAnchorThought = (
  anchorThought: unknown,
): anchorThought is IAnchorThoughtWithQuestions => {
  return (
    !!anchorThought &&
    typeof anchorThought === 'object' &&
    'questions' in anchorThought &&
    Array.isArray((anchorThought as IAnchorThoughtWithQuestions).questions)
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatAnswer = (
  answer: IConceptSeedAnswer,
  question: ConceptIncubationQuestion,
): string => {
  if (!answer) return '';

  let savedAnswers = [...answer.answer];
  let userAnswers: string[] = [];
  if (isMultiSelectQuestion(question)) {
    let multiSelectAnswer = savedAnswers.pop();
    // Format the multi select answer
    if (multiSelectAnswer) {
      if (['b2c', 'b2b', 'b2b2c'].includes(multiSelectAnswer)) {
        multiSelectAnswer = multiSelectAnswer.toUpperCase();
      } else {
        multiSelectAnswer = snakeToTitleCase(multiSelectAnswer);
      }

      userAnswers.push(multiSelectAnswer);
    }
  }

  // Add the remaining answers if any
  if (savedAnswers.length > 0) {
    userAnswers = [...userAnswers, ...savedAnswers];
  }

  if (answer.details) {
    userAnswers = [...userAnswers, answer.details];
  }

  return userAnswers.join(', ');
};

const ConceptSettings: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const { seedDraft, isLoading } = useSeed(concept.seedUuid || '');
  const navigate = useNavigate();
  const { resetQuestionnaire, setIsNewSeed } = useConceptIncubationStore();
  const { mutate: cloneSeed, isLoading: isCloning } = useCloneSeed();

  // Get all ignition questions
  const ignitionQuestions = React.useMemo(
    () =>
      seedDraft?.answers
        ?.filter((answer) => answer.question.isIgnition)
        .sort((a, b) => a.question.order - b.question.order) || [],
    [seedDraft?.answers],
  );

  const filteredClarifyingQuestions = useClarifyingQuestionsWithAnswers(
    seedDraft?.clarifyingQuestions || [],
    seedDraft?.answers,
  );

  const handleCloneConceptSeed = () => {
    if (!seedDraft?.uuid) {
      toast.error('No Seed Available', 'No seed available to clone');
      return;
    }

    cloneSeed(seedDraft.uuid, {
      onSuccess: (clonedSeed) => {
        toast.success('Seed Cloned', 'Concept seed cloned successfully!');
        // Navigate to the incubation page with the cloned seed
        resetQuestionnaire();
        setIsNewSeed(false);
        let baseUrl = `${AppPath.IncubateConcept}`;

        if (clonedSeed.type === 'IDEA_PLAYGROUND') {
          baseUrl = `${AppPath.IdeaPlayground}`;
        }

        navigate(
          `${baseUrl}/?${new URLSearchParams({
            seed: clonedSeed.uuid,
          }).toString()}`,
        );
      },
      onError: (error) => {
        const message = utils.osiris.parseFormError(error);
        toast.error(
          'Seed Clone Failed',
          message || 'Failed to clone concept seed. Please try again.',
        );
      },
    });
  };

  if (isLoading) {
    return <ConceptReportSkeletons.ConceptSettingsSkeleton />;
  }

  // Check if this is an Idea Playground seed with nested questions
  const isIdeaPlaygroundSeed =
    seedDraft?.type === 'IDEA_PLAYGROUND' &&
    seedDraft?.anchorThought &&
    isIdeaPlaygroundAnchorThought(seedDraft.anchorThought);

  // Check if there's any content to display (for non-Idea Playground seeds)
  const hasContent =
    ignitionQuestions.length > 0 ||
    filteredClarifyingQuestions.length > 0 ||
    seedDraft?.anchorThought;

  return (
    <div className='h-full w-full'>
      <div className='mx-0'>
        <div className='no-scrollbar mt-4 flex flex-1 flex-col gap-6'>
          {/* Clone Concept Seed Button - Always visible if seedDraft exists */}
          {seedDraft && (
            <div className='flex items-center justify-end'>
              <button
                onClick={handleCloneConceptSeed}
                className='btn btn-bold aucctus-text-brand-primary group hover:bg-primary-900 hover:text-white'
                disabled={isLoading || isCloning}
              >
                {isCloning ? 'Cloning...' : 'Clone Concept Seed'}
              </button>
            </div>
          )}

          {/* Idea Playground Seed Display - Full visualization for IDEA_PLAYGROUND seeds */}
          {isIdeaPlaygroundSeed && (
            <IdeaPlaygroundSeedDisplay
              anchorThought={
                seedDraft.anchorThought as IAnchorThoughtWithQuestions
              }
            />
          )}

          {/* Non-Idea Playground seed content */}
          {!isIdeaPlaygroundSeed && (
            <>
              {/* Anchor Thought - Display if it exists (basic display for non-IP seeds) */}
              {seedDraft?.anchorThought && (
                <div className='flex flex-col gap-3'>
                  <h2 className='aucctus-text-xl-medium aucctus-text-primary ml-1'>
                    Anchor Thought
                  </h2>
                  <div className='aucctus-bg-primary aucctus-text-secondary rounded-lg p-4'>
                    {seedDraft.anchorThought.thought}
                  </div>
                </div>
              )}

              {/* Initial Questions */}
              {ignitionQuestions.length > 0 && (
                <div className='flex flex-col gap-3'>
                  <h2 className='aucctus-text-xl-medium aucctus-text-primary ml-1'>
                    Initial Questions
                  </h2>
                  <div className='no-scrollbar flex flex-1 flex-col gap-3'>
                    {ignitionQuestions.map((answer) => (
                      <IgnitionQuestion
                        key={`ignition-${answer.question.id}`}
                        answer={answer}
                        question={answer.question}
                        formatAnswer={formatAnswer}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Clarifying Questions */}
              {filteredClarifyingQuestions.length > 0 && (
                <div className='flex flex-col gap-3'>
                  <h2 className='aucctus-text-xl-medium aucctus-text-primary ml-1'>
                    Clarifying Questions
                  </h2>
                  <div className='no-scrollbar flex flex-1 flex-col gap-3'>
                    {filteredClarifyingQuestions.map(({ question, answer }) => {
                      return (
                        <ClarifyingQuestion
                          key={`clarifying-${question.uuid}`}
                          question={question}
                          answer={answer}
                          formatAnswer={formatAnswer}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Content Message */}
              {!hasContent && (
                <div className='flex items-center justify-center py-12'>
                  <p className='aucctus-text-secondary aucctus-text-md'>
                    No seed information available
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConceptSettings;
