import React, { FunctionComponent, useCallback, useState } from 'react';
import { useConceptIgnition } from '../../hooks/query/concepts.hook';
import ConceptIgnitionCard from '../../components/Cards/FormCard/ConceptIgnitionCard';
import images from '../../assets/img';
import TextArea from '../../components/Text/TextArea/TextArea';
import Icon from '../../components/Icons/Icon/Icon';
import InputField from '../../components/Text/InputField/InputField';
import { ConceptSeedType, EEIQuestionKeys, IConceptSeedAttribute, INOQuestionKeys } from '../../../libs/api/types';
import { toast } from 'react-toastify';
import IgniteLoading from '../../components/IgniteLoading';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import WhiteSpaceSuggestion from '../../components/WhiteSpaceSuggestions';
import { useConceptGenerationStore } from '../../stores/concept-generation.store';

const INITIAL_EXPANDING_IDEA: IConceptSeedAttribute<EEIQuestionKeys>[] = [
  { question: 'DESCRIBE', answer: '' },
  { question: 'PROBLEM', answer: '' },
  { question: 'CUSTOMER', answer: '' },
  { question: 'SUCCESS', answer: '' },
];
const INITIAL_NEW_OPPORTUNITY: IConceptSeedAttribute<INOQuestionKeys>[] = [
  { question: 'TARGET', answer: '' },
  { question: 'PROBLEM', answer: '' },
  { question: 'INTEREST', answer: '' },
  { question: 'SUCCESS', answer: '' },
];

export interface ConceptIgnitionInput {
  question: string;
  placeholder: string;
  rows?: number;
  fieldType: 'input' | 'textarea';
  required?: boolean;
}

export const EXPANDING_IDEA_INPUT_MAP: Record<EEIQuestionKeys, ConceptIgnitionInput> = {
  DESCRIBE: {
    question: 'Describe your idea in one sentence',
    placeholder: 'I want to leverage our network of retail stores to deliver healthcare services',
    rows: 2,
    fieldType: 'textarea',
    required: true,
  },
  PROBLEM: {
    question: 'What problem does your idea solve?',
    placeholder: 'Busy customers lack healthcare access and the time to juggle their to-do list.',
    rows: 2,
    fieldType: 'textarea',
  },
  CUSTOMER: {
    question: 'Who might your customers be?',
    placeholder: 'Time-strapped consumers in suburban areas who need to maximize time.',
    rows: 2,
    fieldType: 'textarea',
  },
  SUCCESS: {
    question: 'What will success look like?',
    placeholder: '$15M in new revenue in 24 months.',
    rows: 1,
    fieldType: 'textarea',
  },
};

export const NEW_OPPORTUNITY_INPUT_MAP: Record<INOQuestionKeys, ConceptIgnitionInput> = {
  TARGET: {
    question: 'What industry are you targeting?',
    placeholder: 'Healthcare services',
    fieldType: 'input',
    required: true,
  },
  PROBLEM: {
    question: 'Who are you targeting and what problems need to be solved?',
    placeholder: 'Customers struggle to be assigned a family doctor and access care quickly',
    rows: 2,
    fieldType: 'textarea',
  },
  INTEREST: {
    question: 'Why is your company interested in this?',
    placeholder: 'We have broad reach across the country and have experience training workforces',
    rows: 3,
    fieldType: 'textarea',
  },
  SUCCESS: {
    question: 'What will success look like?',
    placeholder: 'Create a new revenue stream and increase customer satisfaction by 10%',
    rows: 2,
    fieldType: 'textarea',
  },
};

type ConceptSeedTypeMap = {
  EXPAND_AN_EXISTING_IDEA: typeof EXPANDING_IDEA_INPUT_MAP;
  IDENTIFY_NEW_OPPORTUNITIES: typeof NEW_OPPORTUNITY_INPUT_MAP;
  UNKNOWN: never;
};

const CONCEPT_SEED_TYPE_QUESTIONS: ConceptSeedTypeMap = {
  EXPAND_AN_EXISTING_IDEA: EXPANDING_IDEA_INPUT_MAP,
  IDENTIFY_NEW_OPPORTUNITIES: NEW_OPPORTUNITY_INPUT_MAP,
  UNKNOWN: undefined as never,
};

// Define the type for the renderIgnitionInput function
type RenderIgnitionInput = <T extends ConceptSeedType = ConceptSeedType>(
  type: T,
  item: IConceptSeedAttribute<keyof ConceptSeedTypeMap[T]>,
  index: number,
  setter: React.Dispatch<React.SetStateAction<IConceptSeedAttribute<keyof ConceptSeedTypeMap[T]>[]>>,
) => JSX.Element | null;

const IgniteConcept: FunctionComponent = () => {
  const navigate = useNavigate();
  const { mutate: igniteConcept, isLoading } = useConceptIgnition();
  const [expandingIdea, setExpandingIdea] = useState<IConceptSeedAttribute<EEIQuestionKeys>[]>(
    // Create deep copy.
    JSON.parse(JSON.stringify(INITIAL_EXPANDING_IDEA)),
  );
  const [newOpportunities, setNewOpportunities] = useState<IConceptSeedAttribute<INOQuestionKeys>[]>(
    // Create deep copy.
    JSON.parse(JSON.stringify(INITIAL_NEW_OPPORTUNITY)),
  );
  const { setSeed, setGeneratedConcepts } = useConceptGenerationStore();

  const handleIgnition = useCallback(
    (
      attributes: IConceptSeedAttribute<EEIQuestionKeys | INOQuestionKeys>[],
      type: ConceptSeedType,
      numberOfConcepts: number = 10,
    ) => {
      igniteConcept(
        { attributes: attributes, numberOfConcepts, type },
        {
          onSuccess: (data) => {
            setSeed({
              attributes: data.seed || attributes,
              type: type,
            });
            setGeneratedConcepts(data.concepts);
            navigate(AppPath.GeneratedConcepts);
          },
          onError: () => {
            toast.error('Failed to ignite concept');
          },
        },
      );
    },
    [igniteConcept, navigate, setGeneratedConcepts, setSeed],
  );

  const renderIgnitionInput: RenderIgnitionInput = useCallback((type, item, index, setter) => {
    if (type === 'UNKNOWN') return null; // Add this line to prevent rendering of unknown seed type
    const inputProps: ConceptIgnitionInput = CONCEPT_SEED_TYPE_QUESTIONS[type][item.question] as ConceptIgnitionInput;
    const sharedProps = {
      label: inputProps.question,
      name: inputProps.question.toLowerCase().replace(' ', '-'),
      placeholder: inputProps.placeholder,
      value: item.answer,
      required: inputProps.required,
      showAsterisk: inputProps.required,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setter((prev) =>
          prev.map((prevItem, prevIndex) =>
            prevIndex === index ? { ...prevItem, answer: event.target.value } : prevItem,
          ),
        );
      },
    };

    return (
      <div className='flex gap-3.5 self-stretch' key={sharedProps.name + index}>
        {inputProps.fieldType === 'input' ? (
          <InputField {...sharedProps} width='100%' />
        ) : (
          <TextArea {...sharedProps} rows={inputProps.rows || 2} />
        )}
      </div>
    );
  }, []);

  return (
    <div className='flex flex-col items-center gap-10 self-stretch bg-gray-50 pb-11 pt-8'>
      {isLoading ? (
        <IgniteLoading title='Igniting Your Concept' subtitle='This Process takes a moment, please wait.' />
      ) : (
        <>
          <section className='flex w-full flex-col content-center items-center self-stretch text-center'>
            <h1 className="font-['DM Sans'] w-96 text-center text-3xl font-bold leading-9 text-indigo-900">
              Generate New Ideas
            </h1>
            <p className='mt-3 w-full text-sm font-medium leading-5 text-gray-500 max-md:max-w-full'>
              Let Aucctus AI Ignite your imagination and suggest new ideas to transform your business.
            </p>
          </section>

          <section className='w-100 flex flex-row flex-wrap gap-6'>
            <ConceptIgnitionCard
              header={{
                title: 'Expanding An Existing Idea',
                description: "Describe an idea you already have and we'll help you to validate it.",
                color: 'bg-violet-100',
                image: {
                  src: images.expandOnExistingIdeas,
                  alt: 'Expanding An Existing Idea',
                },
              }}
              children={
                <>
                  {expandingIdea.map((item, index) =>
                    renderIgnitionInput('EXPAND_AN_EXISTING_IDEA', item, index, setExpandingIdea),
                  )}
                </>
              }
              footer={
                <>
                  <button
                    className='btn btn-light border border-solid px-2.5 py-2'
                    disabled={expandingIdea.some(
                      (item) => !item.answer && !!EXPANDING_IDEA_INPUT_MAP[item.question].required,
                    )}
                    onClick={() => handleIgnition(expandingIdea, 'EXPAND_AN_EXISTING_IDEA', 10)}
                  >
                    See Similar Ideas
                  </button>

                  <button
                    className='btn btn-secondary border border-violet-50 px-2.5 py-2'
                    disabled={expandingIdea.some(
                      (item) => !item.answer && !!EXPANDING_IDEA_INPUT_MAP[item.question].required,
                    )}
                    onClick={() => handleIgnition(expandingIdea, 'EXPAND_AN_EXISTING_IDEA', 1)}
                  >
                    Expand This Idea
                    <Icon variant='arrowright' />
                  </button>
                </>
              }
            />

            <ConceptIgnitionCard
              header={{
                title: 'Identify New Opportunities',
                description: "Describe an industry you want to enter and we'll suggest ideas that fit your goals.",
                color: 'bg-primary-100',
                image: {
                  src: images.exploreNewSpace,
                  alt: 'Identify New Opportunities',
                },
              }}
              children={
                <>
                  {newOpportunities.map((item, index) =>
                    renderIgnitionInput('IDENTIFY_NEW_OPPORTUNITIES', item, index, setNewOpportunities),
                  )}
                </>
              }
              footer={
                <>
                  <button
                    className='btn btn-secondary w-80 justify-between border border-violet-50 px-2.5 py-2'
                    disabled={newOpportunities.some(
                      (item) => !item.answer && !!NEW_OPPORTUNITY_INPUT_MAP[item.question].required,
                    )}
                    onClick={() => handleIgnition(newOpportunities, 'IDENTIFY_NEW_OPPORTUNITIES', 10)}
                  >
                    Generate Ideas <Icon variant='arrowright' />
                  </button>
                </>
              }
            />

            <ConceptIgnitionCard
              header={{
                title: 'White Space Suggestions',
                description: "Based on what we know about your company, we've suggested some ideas.",
                color: 'bg-gray-50',
                image: {
                  src: images.whiteSpaceSuggestions,
                  alt: 'White Space Suggestions',
                },
              }}
              children={
                <>
                  <button
                    className='btn btn-light inline-flex w-80 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 disabled:cursor-not-allowed'
                    disabled
                  >
                    <Icon variant='clock-stopwatch' />
                    <div className="Text font-['DM Sans'] text-sm font-medium leading-tight text-gray-500">
                      Coming Soon
                    </div>
                  </button>

                  <WhiteSpaceSuggestion
                    title='Drone Delivery Leveraging National Retail Outlets'
                    subtitle='Use your network of stores to deliver online orders via drone'
                  />
                  <WhiteSpaceSuggestion
                    title='Pet Care Stations & Membership Plan'
                    subtitle='Pet grooming subscription plan and integrated food/toy sales.'
                  />
                  <WhiteSpaceSuggestion
                    title='Tech Support & Repair Services'
                    subtitle='In-store hardware repair and education opportunities.'
                  />
                </>
              }
              footer={
                <>
                  <button className='btn btn-light w-80 justify-between border border-violet-50 px-2.5 py-2' disabled>
                    View All Suggestions <Icon variant='arrowright' />
                  </button>
                </>
              }
            />
          </section>
        </>
      )}
    </div>
  );
};

export default IgniteConcept;
