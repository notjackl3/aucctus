import { FunctionComponent, useCallback, useState } from 'react';
import { Input } from '@components';
import TextArea from '../../Input/TextArea/TextArea';
import Icon from '../../Icon/Icon/Icon';
import { useModal } from '../../../context/ModalContextProvider';
import { useCreateAnswer } from '../../../hooks/query/nucleusCrud.hook';

interface AddAnswerModalProps {
  reportUuid: string;
  questionUuid: string;
}

interface Source {
  title: string;
  url: string;
  description: string;
}

const MAX_ANSWER_LENGTH = 2000;
const MAX_SOURCE_TITLE_LENGTH = 200;
const MAX_SOURCE_SUMMARY_LENGTH = 500;

const AddAnswerModal: FunctionComponent<AddAnswerModalProps> = ({
  reportUuid,
  questionUuid,
}) => {
  const { closeModal } = useModal();
  const { mutate: createAnswer, isLoading } = useCreateAnswer(reportUuid);

  const [answer, setAnswer] = useState<string>('');
  const [answerError, setAnswerError] = useState<string | undefined>(undefined);

  const [sources, setSources] = useState<Source[]>([
    { title: '', url: '', description: '' },
  ]);
  const [sourceErrors, setSourceErrors] = useState<{
    [key: number]: { title?: string; url?: string; description?: string };
  }>({});

  const handleAnswerChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const input = e.target.value;
      setAnswerError(undefined);

      if (input.length === 0) {
        setAnswerError('Answer is required.');
      } else if (input.length > MAX_ANSWER_LENGTH) {
        setAnswerError('Answer exceeds the maximum allowed length.');
      }

      setAnswer(input);
    },
    [],
  );

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSourceChange = useCallback(
    (index: number, field: keyof Source, value: string) => {
      const updatedSources = [...sources];
      updatedSources[index] = { ...updatedSources[index], [field]: value };
      setSources(updatedSources);

      // Clear errors for this field
      const updatedErrors = { ...sourceErrors };
      if (updatedErrors[index]) {
        delete updatedErrors[index][field];
        if (Object.keys(updatedErrors[index]).length === 0) {
          delete updatedErrors[index];
        }
      }

      // Validate and set errors
      const errors: { title?: string; url?: string; description?: string } = {};

      if (field === 'title') {
        if (!value.trim()) {
          errors.title = 'Title is required.';
        } else if (value.length > MAX_SOURCE_TITLE_LENGTH) {
          errors.title = 'Title exceeds the maximum allowed length.';
        }
      }

      if (field === 'url') {
        if (!value.trim()) {
          errors.url = 'URL is required.';
        } else if (!validateUrl(value)) {
          errors.url = 'Invalid URL format.';
        }
      }

      if (field === 'description' && value.length > MAX_SOURCE_SUMMARY_LENGTH) {
        errors.description = 'Description exceeds the maximum allowed length.';
      }

      if (Object.keys(errors).length > 0) {
        setSourceErrors({
          ...updatedErrors,
          [index]: { ...updatedErrors[index], ...errors },
        });
      } else {
        setSourceErrors(updatedErrors);
      }
    },
    [sources, sourceErrors],
  );

  const addSource = useCallback(() => {
    setSources([...sources, { title: '', url: '', description: '' }]);
  }, [sources]);

  const removeSource = useCallback(
    (index: number) => {
      if (sources.length > 1) {
        const updatedSources = sources.filter((_, i) => i !== index);
        setSources(updatedSources);

        // Remove errors for this source
        const updatedErrors = { ...sourceErrors };
        delete updatedErrors[index];

        // Reindex remaining errors
        const reindexedErrors: typeof sourceErrors = {};
        Object.keys(updatedErrors).forEach((key) => {
          const keyIndex = parseInt(key);
          if (keyIndex > index) {
            reindexedErrors[keyIndex - 1] = updatedErrors[keyIndex];
          } else if (keyIndex < index) {
            reindexedErrors[keyIndex] = updatedErrors[keyIndex];
          }
        });

        setSourceErrors(reindexedErrors);
      }
    },
    [sources, sourceErrors],
  );

  const validateForm = useCallback(() => {
    let isValid = true;
    const errors: typeof sourceErrors = {};

    // Validate answer
    if (!answer.trim()) {
      setAnswerError('Answer is required.');
      isValid = false;
    } else if (answer.length > MAX_ANSWER_LENGTH) {
      setAnswerError('Answer exceeds the maximum allowed length.');
      isValid = false;
    }

    // Validate sources
    sources.forEach((source, index) => {
      const sourceError: {
        title?: string;
        url?: string;
        description?: string;
      } = {};

      if (!source.title.trim()) {
        sourceError.title = 'Title is required.';
        isValid = false;
      } else if (source.title.length > MAX_SOURCE_TITLE_LENGTH) {
        sourceError.title = 'Title exceeds the maximum allowed length.';
        isValid = false;
      }

      if (!source.url.trim()) {
        sourceError.url = 'URL is required.';
        isValid = false;
      } else if (!validateUrl(source.url)) {
        sourceError.url = 'Invalid URL format.';
        isValid = false;
      }

      if (source.description.length > MAX_SOURCE_SUMMARY_LENGTH) {
        sourceError.description =
          'Description exceeds the maximum allowed length.';
        isValid = false;
      }

      if (Object.keys(sourceError).length > 0) {
        errors[index] = sourceError;
      }
    });

    setSourceErrors(errors);
    return isValid;
  }, [answer, sources]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      const submissionData = {
        answer: answer.trim(),
        sources: sources.map((source) => ({
          title: source.title.trim(),
          url: source.url.trim(),
          description: source.description.trim() || undefined,
        })),
      };

      createAnswer(
        {
          questionUuid,
          data: submissionData,
        },
        {
          onSuccess: () => {
            closeModal();
          },
        },
      );
    },
    [answer, sources, questionUuid, createAnswer, closeModal, validateForm],
  );

  const isFormValid =
    answer.trim() &&
    sources.every(
      (s) => s.title.trim() && s.url.trim() && validateUrl(s.url),
    ) &&
    !answerError &&
    Object.keys(sourceErrors).length === 0;

  return (
    <div className='aucctus-bg-primary flex max-h-[90vh] max-w-[600px] flex-col gap-6 overflow-y-auto rounded-xl p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1
          className='aucctus-text-xl-semibold aucctus-text-primary'
          id='add-answer-modal-title'
        >
          Add Answer
        </h1>
        <button
          aria-label='Close modal'
          className='btn btn-light btn-no-border'
          disabled={isLoading}
          onClick={closeModal}
          type='button'
        >
          <Icon variant='closeX' />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
        {/* Answer Section */}
        <div className='flex flex-col gap-2'>
          <TextArea
            label='Answer'
            name='answer'
            value={answer}
            errorMessage={answerError}
            onChange={handleAnswerChange}
            placeholder='Enter your answer...'
            maxLength={MAX_ANSWER_LENGTH}
            disabled={isLoading}
            showAsterisk
            required
            rows={6}
          />
        </div>

        {/* Sources Section */}
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <h3 className='aucctus-text-md-semibold aucctus-text-primary'>
              Sources *
            </h3>
            <button
              type='button'
              className='btn btn-light btn-sm'
              onClick={addSource}
              disabled={isLoading}
              aria-label='Add source'
            >
              <Icon variant='plus' width={16} height={16} />
              Add Source
            </button>
          </div>

          {sources.map((source, index) => (
            <div
              key={index}
              className='aucctus-border-primary flex flex-col gap-3 rounded-lg border p-4'
            >
              <div className='flex items-center justify-between'>
                <span className='aucctus-text-sm-semibold aucctus-text-secondary'>
                  Source {index + 1}
                </span>
                {sources.length > 1 && (
                  <button
                    type='button'
                    className='btn btn-light btn-no-border btn-sm'
                    onClick={() => removeSource(index)}
                    disabled={isLoading}
                    aria-label={`Remove source ${index + 1}`}
                  >
                    <Icon variant='trash' width={16} height={16} />
                  </button>
                )}
              </div>

              <Input.Field
                label='Title'
                name={`source-title-${index}`}
                value={source.title}
                errorMessage={sourceErrors[index]?.title}
                onChange={(e) =>
                  handleSourceChange(index, 'title', e.target.value)
                }
                placeholder='Enter source title...'
                maxLength={MAX_SOURCE_TITLE_LENGTH}
                disabled={isLoading}
                showAsterisk
                required
              />

              <Input.Field
                label='URL'
                name={`source-url-${index}`}
                value={source.url}
                errorMessage={sourceErrors[index]?.url}
                onChange={(e) =>
                  handleSourceChange(index, 'url', e.target.value)
                }
                placeholder='https://example.com'
                type='url'
                disabled={isLoading}
                showAsterisk
                required
              />

              <TextArea
                label='Description (Optional)'
                name={`source-description-${index}`}
                value={source.description}
                errorMessage={sourceErrors[index]?.description}
                onChange={(e) =>
                  handleSourceChange(index, 'description', e.target.value)
                }
                placeholder='Brief description of the source content...'
                maxLength={MAX_SOURCE_SUMMARY_LENGTH}
                disabled={isLoading}
                rows={3}
              />
            </div>
          ))}
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
            {isLoading ? 'Creating...' : 'Create Answer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAnswerModal;
