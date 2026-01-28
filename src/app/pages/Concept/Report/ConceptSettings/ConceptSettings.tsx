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
import { IdeaSubmissionQuestion } from './components/IdeaSubmissionQuestion';
import { useClarifyingQuestionsWithAnswers } from '@hooks/concepts/clarifying-questions.hook';
import { useCloneSeed } from '@hooks/query/concepts.hook';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '@routes/routes';
import utils from '@libs/utils';

import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';

/**
 * Parse watchtower signal description to extract structured data.
 * Watchtower descriptions have the format:
 * "Main description text.
 *
 * Signal Basis: value
 * Potential Impact: value
 * Urgency: value"
 */
interface ParsedWatchtowerData {
  context: string;
  signalBasis?: string;
  potentialImpact?: string;
  urgency?: string;
}

const parseWatchtowerDescription = (
  description: string | undefined,
): ParsedWatchtowerData | null => {
  if (!description) return null;

  const lines = description.split('\n');
  let context = '';
  let signalBasis: string | undefined;
  let potentialImpact: string | undefined;
  let urgency: string | undefined;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('Signal Basis:')) {
      signalBasis = trimmedLine.replace('Signal Basis:', '').trim();
    } else if (trimmedLine.startsWith('Potential Impact:')) {
      potentialImpact = trimmedLine.replace('Potential Impact:', '').trim();
    } else if (trimmedLine.startsWith('Urgency:')) {
      urgency = trimmedLine.replace('Urgency:', '').trim();
    } else if (trimmedLine) {
      // Add to context if it's not a metadata line
      context += (context ? '\n' : '') + trimmedLine;
    }
  }

  return { context, signalBasis, potentialImpact, urgency };
};

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

  // Check if this is a watchtower seed
  const isWatchtowerSeed = seedDraft?.type === 'WATCHTOWER_SIGNAL';
  // Check if this is an employee submission seed
  const isEmployeeSubmissionSeed = seedDraft?.type === 'EMPLOYEE_SUBMISSION';

  // Parse watchtower description to extract structured data
  // Must be called before early returns to satisfy React hooks rules
  const parsedWatchtowerData = React.useMemo(() => {
    if (isWatchtowerSeed) {
      return parseWatchtowerDescription(seedDraft?.description);
    }
    return null;
  }, [isWatchtowerSeed, seedDraft?.description]);

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

  const ideaSubmissions = seedDraft?.ideaSubmissions || [];

  // For watchtower seeds, use the parsed context; for others, use description
  const seedContext = isWatchtowerSeed
    ? parsedWatchtowerData?.context
    : seedDraft?.description;

  // Determine if we have seed summary content
  const hasSeedSummary = isWatchtowerSeed
    ? !!parsedWatchtowerData?.context
    : isEmployeeSubmissionSeed
      ? !!seedDraft?.description
      : !!seedDraft?.title || !!seedDraft?.description;

  // Check if there's any content to display (for non-Idea Playground seeds)
  const hasContent =
    ideaSubmissions.length > 0 ||
    hasSeedSummary ||
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
              {/* Seed Summary - show CONTEXT only for watchtower/submission, both for regular */}
              {hasSeedSummary && (
                <div className='flex flex-col gap-3'>
                  <h2 className='aucctus-text-xl-medium aucctus-text-primary ml-1'>
                    Seed Summary
                  </h2>
                  <div className='aucctus-bg-primary aucctus-text-secondary flex flex-col gap-3 rounded-lg p-4'>
                    {/* For regular seeds, show title if no description */}
                    {!isWatchtowerSeed &&
                      !isEmployeeSubmissionSeed &&
                      seedDraft?.title &&
                      !seedDraft?.description && (
                        <div className='flex flex-col gap-1'>
                          <span className='aucctus-text-tertiary text-xs uppercase'>
                            Title
                          </span>
                          <span className='aucctus-text-primary'>
                            {seedDraft.title}
                          </span>
                        </div>
                      )}
                    {/* Show context - parsed for watchtower, raw for others */}
                    {seedContext && (
                      <div className='flex flex-col gap-1'>
                        <span className='aucctus-text-tertiary text-xs uppercase'>
                          Context
                        </span>
                        <span className='aucctus-text-primary whitespace-pre-line'>
                          {seedContext}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

              {/* Initial Questions - for regular seeds, watchtower seeds, or employee submission seeds */}
              {(ignitionQuestions.length > 0 ||
                (isWatchtowerSeed && parsedWatchtowerData) ||
                (isEmployeeSubmissionSeed && ideaSubmissions.length > 0)) && (
                <div className='flex flex-col gap-3'>
                  <h2 className='aucctus-text-xl-medium aucctus-text-primary ml-1'>
                    Initial Questions
                  </h2>
                  <div className='no-scrollbar flex flex-1 flex-col gap-3'>
                    {/* Regular ignition questions */}
                    {ignitionQuestions.map((answer) => (
                      <IgnitionQuestion
                        key={`ignition-${answer.question.id}`}
                        answer={answer}
                        question={answer.question}
                        formatAnswer={formatAnswer}
                      />
                    ))}
                    {/* Watchtower signal questions */}
                    {isWatchtowerSeed && parsedWatchtowerData && (
                      <>
                        <IdeaSubmissionQuestion
                          label='What is the signal basis?'
                          answer={parsedWatchtowerData.signalBasis || ''}
                          iconVariant='signal-02'
                        />
                        <IdeaSubmissionQuestion
                          label='What is the potential impact?'
                          answer={parsedWatchtowerData.potentialImpact || ''}
                          iconVariant='target'
                        />
                        <IdeaSubmissionQuestion
                          label='What is the urgency level?'
                          answer={parsedWatchtowerData.urgency || ''}
                          iconVariant='clock'
                        />
                      </>
                    )}
                    {/* Idea submission questions (for employee submission seeds) */}
                    {isEmployeeSubmissionSeed &&
                      ideaSubmissions.map((submission) => (
                        <React.Fragment key={`submission-${submission.uuid}`}>
                          <IdeaSubmissionQuestion
                            label='Describe the idea you have'
                            answer={submission.title}
                            iconVariant='help-circle'
                          />
                          <IdeaSubmissionQuestion
                            label='Describe the problem your idea solves'
                            answer={submission.problemStatement}
                            iconVariant='alert-circle'
                          />
                          <IdeaSubmissionQuestion
                            label='What is your proposed solution?'
                            answer={submission.proposedSolution}
                            iconVariant='lightbulb'
                          />
                          <IdeaSubmissionQuestion
                            label='What is the expected impact?'
                            answer={submission.expectedImpact}
                            iconVariant='target'
                          />
                        </React.Fragment>
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
