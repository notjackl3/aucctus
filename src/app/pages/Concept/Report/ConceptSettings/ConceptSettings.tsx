import { Loading } from '@components';
import { useSeed } from '@hooks/query/concepts.hook';
import { ConceptIncubationQuestion, IConceptSeedAnswer } from '@libs/api/types';
import { isMultiSelectQuestion } from '@libs/api/utils/typeGuards';
import { snakeToTitleCase } from '@libs/utils/string';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';
import { useClarifyingQuestionsWithAnswers } from './clarifying-questions.hook';
import { ClarifyingQuestion } from './components/ClarifyingQuestion';
import { IgnitionQuestion } from './components/IgnitionQuestion';

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

  return (
    <div className='h-full w-full'>
      <div className='mx-0 max-w-3xl'>
        {isLoading ? (
          <div className='flex w-full justify-center py-8'>
            <Loading />
          </div>
        ) : (
          <div className='no-scrollbar mt-4 flex flex-1 flex-col gap-6'>
            {ignitionQuestions.length > 0 && (
              <>
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
              </>
            )}

            {filteredClarifyingQuestions.length > 0 && (
              <>
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptSettings;
