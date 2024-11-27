import images from '@assets/img';
import { Button, Card, Icon, Input, Loading } from '@components';
import IgniteLoading from '@components/IgniteLoading';
import React from 'react';

import {
  useConceptIgnition,
  useConceptIgnitionQuestionnaire,
} from '@hooks/query/concepts.hook';
import {
  ConceptIgnitionQuestionnaireType,
  IConceptIgnitionQuestionnaire,
  QuestionIdentifier,
} from '@libs/api/types';
// import { useNavigate } from 'react-router-dom';
import { IIgnitionAnswer } from '@libs/api/igniteConcepts';
import { AppPath } from '@routes/routes';
import { useConceptGenerationStore } from '@stores/concept-generation.store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ExpandAnExistingIdeaFooter from './ExpandAnExistingIdeaFooter';
import WhiteSpaceSuggestions from './WhiteSpaceSuggestions';

// Constants
const QUESTIONNAIRE_HEADERS = {
  expandAnExistingIdea: {
    title: 'Expanding An Existing Idea',
    description:
      "Describe an idea you already have and we'll help you validate it.",
    color: 'bg-violet-100',
    image: {
      src: images.expandOnExistingIdeas,
      alt: 'Expanding An Existing Idea',
    },
  },
  identifyNewOpportunities: {
    title: 'Identify New Opportunities',
    description:
      "Describe an industry you want to enter and we'll suggest ideas that fit your goals.",
    color: 'bg-primary-100',
    image: {
      src: images.exploreNewSpace,
      alt: 'Identify New Opportunities',
    },
  },
};

type ConceptQuestionnaireName = keyof IConceptIgnitionQuestionnaire;

type AnswerStore = {
  [key in ConceptQuestionnaireName]: {
    [key in QuestionIdentifier]?: IIgnitionAnswer;
  };
};

const questionnaireTypeMap: Record<
  ConceptQuestionnaireName,
  ConceptIgnitionQuestionnaireType
> = {
  expandAnExistingIdea: 'EXPAND_AN_EXISTING_IDEA',
  identifyNewOpportunities: 'IDENTIFY_NEW_OPPORTUNITIES',
};

// Component
const IgniteConcept: React.FC = () => {
  const navigate = useNavigate();
  const { setSeed, setGeneratedConcepts } = useConceptGenerationStore();
  const { mutate: igniteConcept, isLoading } = useConceptIgnition();
  const { questionnaires } = useConceptIgnitionQuestionnaire();
  const [answers, setAnswers] = React.useState<AnswerStore>({
    expandAnExistingIdea: {},
    identifyNewOpportunities: {},
  });

  const handleAnswerChange = (
    questionnaireName: ConceptQuestionnaireName,
    identifier: QuestionIdentifier,
    answer: Partial<IIgnitionAnswer>,
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionnaireName]: {
        ...prev[questionnaireName],
        [identifier]: {
          ...prev[questionnaireName][identifier],
          ...answer,
        },
      },
    }));
  };

  const areAllRequiredQuestionsAnswered = (
    questionnaireName: ConceptQuestionnaireName,
  ) => {
    const questionnaire = questionnaires[questionnaireName];
    const answerBook = answers[questionnaireName];

    if (!questionnaire.questions) return true;

    return Object.entries(questionnaire.questions).every(
      ([identifier, question]) => {
        if (!question.required) return true;

        const id = identifier as QuestionIdentifier;
        const answer = answerBook[id]?.answer?.trim();

        return answer !== '' && answer !== undefined;
      },
    );
  };

  const renderQuestions = (
    questionnaireName: ConceptQuestionnaireName,
    questions?: IConceptIgnitionQuestionnaire[ConceptQuestionnaireName]['questions'],
  ) => {
    if (!questions) {
      return (
        <div className='flex h-full w-full items-center justify-center'>
          <Loading />
        </div>
      );
    }

    return Object.entries(questions).map(([identifier, question]) => {
      const id = identifier as QuestionIdentifier;
      let userAnswer = answers[questionnaireName][id];

      const defaultQuestionAttrs = {
        questionId: question.id,
        fieldType: question.fieldType,
      };

      // If this is a mutiSelect with a default value set the default value in the answers
      if (
        question.fieldType === 'multiSelect' &&
        userAnswer?.answer === undefined &&
        question.defaultOption
      ) {
        handleAnswerChange(questionnaireName, id, {
          answer: question.defaultOption,
          ...defaultQuestionAttrs,
        });
        return null;
      }
      userAnswer = answers[questionnaireName][id];

      return (
        <Input.ConceptIgnition
          key={`${questionnaireName}-${id}`}
          question={question}
          value={userAnswer?.answer}
          details={userAnswer?.details}
          onChange={(value) =>
            handleAnswerChange(questionnaireName, id, {
              answer: value,
              ...defaultQuestionAttrs,
            })
          }
          onDetailChange={(value) =>
            handleAnswerChange(questionnaireName, id, {
              details: value,
              ...defaultQuestionAttrs,
            })
          }
          onMultiSelectChange={(value) =>
            handleAnswerChange(questionnaireName, id, {
              answer: value,
              ...defaultQuestionAttrs,
            })
          }
        />
      );
    });
  };

  const handleSubmission = (
    questionnaireName: ConceptQuestionnaireName,
    numberOfConcepts: number = 10,
  ) => {
    const questionnaireAnswers = answers[questionnaireName];

    igniteConcept(
      {
        numberOfConcepts,
        type: questionnaireTypeMap[questionnaireName],
        answers: questionnaireAnswers,
      },
      {
        onSuccess: (data) => {
          setSeed({
            answers: questionnaireAnswers,
            type: questionnaireTypeMap[questionnaireName],
          });
          setGeneratedConcepts(data.concepts);
          navigate(AppPath.GeneratedConcepts);
        },
        onError: () => {
          toast.error('Failed to ignite concept');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className='flex flex-col items-center gap-10 self-stretch bg-gray-50 pb-11 pt-8'>
        <IgniteLoading
          title='Igniting Your Concept'
          subtitle='This process takes a moment, please wait.'
        />
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center gap-10 self-stretch bg-gray-50 pb-11 pt-8'>
      <section className='flex w-full flex-col content-center items-center self-stretch text-center'>
        <h1 className='w-96 text-center text-3xl font-bold leading-9 text-indigo-900'>
          Generate New Ideas
        </h1>
        <p className='mt-3 w-full text-base font-medium leading-5 text-gray-500 max-md:max-w-full'>
          Let Aucctus AI ignite your imagination and suggest new ideas to
          transform your business.
        </p>
      </section>

      <section className='flex w-full flex-row flex-wrap justify-center gap-6'>
        {/* Expand An Existing Idea */}
        <Card.Ignition
          header={QUESTIONNAIRE_HEADERS.expandAnExistingIdea}
          footer={
            <ExpandAnExistingIdeaFooter
              disabled={
                !areAllRequiredQuestionsAnswered('expandAnExistingIdea')
              }
              onSeeIdeasClick={() => handleSubmission('expandAnExistingIdea')}
              onExpandClick={() => handleSubmission('expandAnExistingIdea', 1)}
            />
          }
        >
          {renderQuestions(
            'expandAnExistingIdea',
            questionnaires.expandAnExistingIdea.questions,
          )}
        </Card.Ignition>

        {/* Identify New Opportunities */}
        <Card.Ignition
          header={QUESTIONNAIRE_HEADERS.identifyNewOpportunities}
          footer={
            <Button
              color='primary'
              className='w-full justify-between px-2.5 py-2'
              disabled={
                !areAllRequiredQuestionsAnswered('identifyNewOpportunities')
              }
              onClick={() => handleSubmission('identifyNewOpportunities')}
            >
              Generate Ideas
              <Icon variant='arrowright' />
            </Button>
          }
        >
          {renderQuestions(
            'identifyNewOpportunities',
            questionnaires.identifyNewOpportunities.questions,
          )}
        </Card.Ignition>

        {/* White Space Concept Ignition Card */}
        <WhiteSpaceSuggestions />
      </section>
    </div>
  );
};

export default IgniteConcept;
