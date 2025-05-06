import React from 'react';
import { Icon } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { IUserJourneyStep } from '@libs/api/types';
import { RELATION_TYPE } from '../../pages/Concept/Report/CustomerProfile/Details/UserJourneyFlow';
import { cn } from '@libs/utils/react';

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
  const [relationType, setRelationType] = React.useState<string | undefined>(
    initialStep?.relationType || RELATION_TYPE.JOURNEY_STEP,
  );

  const handleCancel = () => {
    closeModal();
  };

  const handleRelationTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setRelationType(e.target.value);
  };

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
      <div className='aucctus-border-primary inline-flex w-full items-center justify-between border-b p-4'>
        <h5 className='aucctus-header-md aucctus-text-primary'>
          {initialStep ? 'Edit' : 'Add'} Journey Step
        </h5>
        <button
          className='aucctus-bg-secondary-hover rounded-lg p-2'
          onClick={closeModal}
          aria-label='Close modal'
        >
          <Icon variant='closeX' className='aucctus-fill-secondary h-5 w-5' />
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

          <div className='mb-6'>
            <label className='aucctus-text-sm aucctus-text-primary mb-2 block'>
              Step Type
            </label>
            <select
              className='aucctus-border-secondary aucctus-text-primary w-full rounded-md border bg-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={relationType}
              onChange={handleRelationTypeChange}
            >
              <option value={RELATION_TYPE.JOURNEY_STEP}>Journey Step</option>
              <option value={RELATION_TYPE.JTBD}>Job to be Done</option>
              <option value={RELATION_TYPE.PAIN}>Pain Point</option>
              <option value={RELATION_TYPE.MOMENT_OF_INTERVENTION}>
                Moment of Intervention
              </option>
            </select>
          </div>

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
