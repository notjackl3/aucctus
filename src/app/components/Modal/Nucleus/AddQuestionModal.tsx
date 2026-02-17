import { FunctionComponent, useCallback, useState } from 'react';
import { Input } from '@components';
import { useModal } from '../../../context/ModalContextProvider';
import { useCreateQuestion } from '../../../hooks/query/nucleusCrud.hook';
import { AssessmentStatus } from '@libs/api/types/nucleus';
import CategorySelect from '../../Modal/CustomerProfile/CategorySelect';
import { X } from 'lucide-react';

interface AddQuestionModalProps {
  reportUuid: string;
  sectionUuid: string;
}

const MAX_QUESTION_LENGTH = 500;

const questionTypeOptions: readonly string[] = [
  'Core Question (P1 - Critical)',
  'Deeper Research (P2 - Important)',
] as const;

const assessmentStatusOptions: readonly string[] = [
  'Validated - Question is confirmed and accurate',
  'New Details - Additional information available',
  'Needs Input - Requires user review or input',
] as const;

// Helper functions to map between display text and values
const mapQuestionTypeToOption = (type: 'core' | 'deeper'): string => {
  return type === 'core' ? questionTypeOptions[0] : questionTypeOptions[1];
};

const mapOptionToQuestionType = (option: string): 'core' | 'deeper' => {
  return option === questionTypeOptions[0] ? 'core' : 'deeper';
};

const mapAssessmentStatusToOption = (status: AssessmentStatus): string => {
  switch (status) {
    case 'validated':
      return assessmentStatusOptions[0];
    case 'new_details':
      return assessmentStatusOptions[1];
    case 'needs_input':
      return assessmentStatusOptions[2];
    default:
      return assessmentStatusOptions[2];
  }
};

const mapOptionToAssessmentStatus = (option: string): AssessmentStatus => {
  switch (option) {
    case assessmentStatusOptions[0]:
      return 'validated';
    case assessmentStatusOptions[1]:
      return 'new_details';
    case assessmentStatusOptions[2]:
      return 'needs_input';
    default:
      return 'needs_input';
  }
};

const AddQuestionModal: FunctionComponent<AddQuestionModalProps> = ({
  reportUuid,
  sectionUuid,
}) => {
  const { closeModal } = useModal();
  const { mutate: createQuestion, isLoading } = useCreateQuestion(reportUuid);

  const [question, setQuestion] = useState<string>('');
  const [whyItMatters, setWhyItMatters] = useState<string>('');
  const [questionError, setQuestionError] = useState<string | undefined>(
    undefined,
  );
  const [whyItMattersError, setWhyItMattersError] = useState<
    string | undefined
  >(undefined);
  const [questionType, setQuestionType] = useState<'core' | 'deeper'>('core');
  const [assessmentStatus, setAssessmentStatus] =
    useState<AssessmentStatus>('needs_input');
  const [questionTypeError, setQuestionTypeError] = useState<
    string | undefined
  >(undefined);
  const [assessmentStatusError, setAssessmentStatusError] = useState<
    string | undefined
  >(undefined);

  const handleQuestionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setQuestionError(undefined);

      if (input.length === 0) {
        setQuestionError('Question is required.');
      } else if (input.length > MAX_QUESTION_LENGTH) {
        setQuestionError('Question exceeds the maximum allowed length.');
      }

      setQuestion(input);
    },
    [],
  );

  const handleWhyItMattersChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const input = e.target.value;
      setWhyItMattersError(undefined);

      if (input.length === 0) {
        setWhyItMattersError('Why it matters is required.');
      } else if (input.length > MAX_QUESTION_LENGTH) {
        setWhyItMattersError(
          'Why it matters exceeds the maximum allowed length.',
        );
      }

      setWhyItMatters(input);
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validate before submit
      if (!question.trim()) {
        setQuestionError('Question is required.');
        return;
      }

      if (!whyItMatters.trim()) {
        setWhyItMattersError('Why it matters is required.');
        return;
      }

      if (question.length > MAX_QUESTION_LENGTH) {
        setQuestionError('Question exceeds the maximum allowed length.');
        return;
      }

      if (whyItMatters.length > MAX_QUESTION_LENGTH) {
        setWhyItMattersError(
          'Why it matters exceeds the maximum allowed length.',
        );
        return;
      }

      // Map question type to priority
      const priority = questionType === 'core' ? 'P1' : 'P2';

      createQuestion(
        {
          sectionUuid,
          data: {
            question: question.trim(),
            whyItMatters: whyItMatters.trim(),
            priority,
            assessmentStatus,
          },
        },
        {
          onSuccess: () => {
            closeModal();
          },
        },
      );
    },
    [
      question,
      whyItMatters,
      questionType,
      assessmentStatus,
      sectionUuid,
      createQuestion,
      closeModal,
    ],
  );

  const isFormValid =
    question.trim() &&
    whyItMatters.trim() &&
    !questionError &&
    !whyItMattersError;

  return (
    <div className='aucctus-bg-primary flex max-w-[500px] flex-col gap-6 rounded-xl p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1
          className='aucctus-text-xl-semibold aucctus-text-primary'
          id='add-question-modal-title'
        >
          Add Question
        </h1>
        <button
          aria-label='Close modal'
          className='btn btn-light btn-no-border'
          disabled={isLoading}
          onClick={closeModal}
          type='button'
        >
          <X />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <Input.Field
          label='Question'
          name='question'
          value={question}
          errorMessage={questionError}
          onChange={handleQuestionChange}
          placeholder='Enter your question...'
          maxLength={MAX_QUESTION_LENGTH}
          disabled={isLoading}
          showAsterisk
          required
          aria-describedby={questionError ? 'question-error' : undefined}
        />

        {/* Character count for question */}
        <div className='aucctus-text-secondary text-right text-sm'>
          {question.length}/{MAX_QUESTION_LENGTH}
        </div>

        <Input.TextArea
          label='Why it matters'
          name='whyItMatters'
          value={whyItMatters}
          errorMessage={whyItMattersError}
          onChange={handleWhyItMattersChange}
          placeholder='Explain why this question is important...'
          maxLength={MAX_QUESTION_LENGTH}
          disabled={isLoading}
          showAsterisk
          required
          rows={3}
          aria-describedby={
            whyItMattersError ? 'why-it-matters-error' : undefined
          }
        />

        {/* Character count for why it matters */}
        <div className='aucctus-text-secondary text-right text-sm'>
          {whyItMatters.length}/{MAX_QUESTION_LENGTH}
        </div>

        {/* Question Type Dropdown */}
        <CategorySelect
          label='Question Type'
          selectedValue={mapQuestionTypeToOption(questionType)}
          options={questionTypeOptions}
          onChange={(option: string) => {
            setQuestionType(mapOptionToQuestionType(option));
            setQuestionTypeError(undefined);
          }}
          errorMessage={questionTypeError}
          required
        />
        <div className='aucctus-text-secondary -mt-2 text-xs'>
          Core questions address fundamental company insights. Deeper research
          questions explore strategic context.
        </div>

        {/* Assessment Status Dropdown */}
        <CategorySelect
          label='Assessment Status'
          selectedValue={mapAssessmentStatusToOption(assessmentStatus)}
          options={assessmentStatusOptions}
          onChange={(option: string) => {
            setAssessmentStatus(mapOptionToAssessmentStatus(option));
            setAssessmentStatusError(undefined);
          }}
          errorMessage={assessmentStatusError}
          required
        />
        <div className='aucctus-text-secondary -mt-2 text-xs'>
          Assessment status indicates the current validation state of this
          question.
        </div>

        {/* Actions */}
        <div className='flex flex-row justify-between gap-4 pt-2'>
          <button
            type='button'
            className='btn btn-light w-1/2'
            disabled={isLoading}
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            type='submit'
            className='btn btn-primary w-1/2'
            disabled={!isFormValid || isLoading}
            aria-describedby='submit-button-description'
          >
            {isLoading ? 'Creating...' : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuestionModal;
