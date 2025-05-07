import React from 'react';
import { Icon } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { IUserJourneyStep } from '@libs/api/types';
import { RELATION_TYPE } from '../../pages/Concept/Report/CustomerProfile/Details/UserJourneyFlow';
import { cn } from '@libs/utils/react';
import CategorySelect from './CustomerProfile/CategorySelect';

interface JourneyStepModalProps {
  onSubmit: (step: IUserJourneyStep) => void;
  initialStep?: IUserJourneyStep;
  isEdit?: boolean;
}

const JourneyStepModal: React.FC<JourneyStepModalProps> = ({
  onSubmit,
  initialStep,
}) => {
  const { closeModal } = useModal();
  const [title, setTitle] = React.useState(initialStep?.title || '');
  const [description, setDescription] = React.useState(
    initialStep?.description || '',
  );
  const [relationType, setRelationType] = React.useState<string>(
    initialStep?.relationType || RELATION_TYPE.JOURNEY_STEP,
  );

  const handleCancel = () => {
    closeModal();
  };

  // Define step type options
  const stepTypeOptions = [
    RELATION_TYPE.JOURNEY_STEP,
    RELATION_TYPE.JTBD,
    RELATION_TYPE.PAIN,
    RELATION_TYPE.MOMENT_OF_INTERVENTION,
  ] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Make sure we have title and description
    if (!title.trim() || !description.trim()) {
      return;
    }

    // Prepare the step data
    const stepData = {
      uuid: initialStep?.uuid,
      title,
      description,
      relationType: relationType,
      order: initialStep?.order,
    };

    onSubmit(stepData as IUserJourneyStep);
  };

  return (
    <div className='aucctus-bg-primary inline-flex max-h-[100vh] w-[600px] flex-col items-center justify-start rounded-xl'>
      {/* Header */}
      <div className='aucctus-border-primary inline-flex w-full items-center justify-between p-4'>
        <span className='aucctus-text-lg-medium aucctus-text-primary pl-2'>
          {initialStep ? 'Edit' : 'Add'} Journey Step
        </span>
        <button
          className='aucctus-bg-primary-hover rounded-lg p-2'
          onClick={closeModal}
          aria-label='Close modal'
        >
          <Icon variant='closeX' className='aucctus-stroke-secondary h-6 w-6' />
        </button>
      </div>

      <div className='inline-flex w-full items-start justify-start overflow-auto p-6'>
        <form onSubmit={handleSubmit} className='w-full'>
          <div className='mb-4'>
            <label className='aucctus-text-sm aucctus-text-primary mb-2 block'>
              Title
            </label>
            <input
              type='text'
              className='aucctus-border-secondary aucctus-text-primary w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Limited Options'
              required
            />
          </div>

          <div className='mb-4'>
            <label className='aucctus-text-sm aucctus-text-primary mb-2 block'>
              Description
            </label>
            <textarea
              className='aucctus-border-secondary aucctus-text-primary w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Struggling to find healthy snacks on campus'
              rows={4}
              required
            />
          </div>

          <CategorySelect
            label='Step Type'
            selectedValue={relationType}
            options={stepTypeOptions}
            onChange={(value) => setRelationType(value)}
          />

          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={handleCancel}
              className={cn('btn btn-secondary', {
                'cursor-not-allowed opacity-50':
                  !title.trim() || !description.trim(),
              })}
            >
              Cancel
            </button>
            <button
              type='submit'
              className={cn('btn btn-primary', {
                'cursor-not-allowed opacity-50':
                  !title.trim() || !description.trim(),
              })}
              disabled={!title.trim() || !description.trim()}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JourneyStepModal;
