import React, { useState } from 'react';
import { IUserJourneyStep } from '@libs/api/types';
import { RELATION_TYPE } from '../UserJourneyFlow';

interface AddStepFormProps {
  onSubmit: (step: Omit<IUserJourneyStep, 'uuid'>) => void;
  onCancel: () => void;
  initialStep?: IUserJourneyStep;
  isEdit?: boolean;
}

const AddStepForm: React.FC<AddStepFormProps> = ({
  onSubmit,
  onCancel,
  initialStep,
  isEdit = false,
}) => {
  const [title, setTitle] = useState(initialStep?.title || '');
  const [description, setDescription] = useState(
    initialStep?.description || '',
  );
  const [relationType, setRelationType] = useState<string | undefined>(
    initialStep?.relationType || RELATION_TYPE.JOURNEY_STEP,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      relationType: relationType || RELATION_TYPE.JOURNEY_STEP,
      order: initialStep?.order || 0,
      icon: initialStep?.icon,
    } as Omit<IUserJourneyStep, 'uuid'>);

    // Reset form
    setTitle('');
    setDescription('');
    setRelationType(RELATION_TYPE.JOURNEY_STEP);
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col space-y-4'>
      {/* Title */}
      <div>
        <label
          htmlFor='step-title'
          className='aucctus-text-primary mb-2 block font-medium'
        >
          Title
        </label>
        <input
          id='step-title'
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Step title'
          className='aucctus-border-secondary focus:ring-brand-primary w-full rounded border px-3 py-2 focus:outline-none focus:ring-1'
          required
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor='step-description'
          className='aucctus-text-primary mb-2 block font-medium'
        >
          Description
        </label>
        <textarea
          id='step-description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Step description'
          className='aucctus-border-secondary focus:ring-brand-primary w-full rounded border px-3 py-2 focus:outline-none focus:ring-1'
          rows={3}
        />
      </div>

      {/* Step Type Selector */}
      <div>
        <label
          htmlFor='step-type'
          className='aucctus-text-primary mb-2 block font-medium'
        >
          Step Type
        </label>
        <select
          id='step-type'
          value={relationType}
          onChange={(e) => setRelationType(e.target.value)}
          className='aucctus-border-secondary focus:ring-brand-primary w-full rounded border px-3 py-2 focus:outline-none focus:ring-1'
        >
          <option value={RELATION_TYPE.JOURNEY_STEP}>Journey Step</option>
          <option value={RELATION_TYPE.JTBD}>Job to be Done</option>
          <option value={RELATION_TYPE.PAIN}>Pain Point</option>
          <option value={RELATION_TYPE.MOMENT_OF_INTERVENTION}>
            Moment of Intervention
          </option>
        </select>
      </div>

      {/* Form Actions */}
      <div className='flex justify-end gap-3 pt-4'>
        <button
          type='button'
          onClick={onCancel}
          className='aucctus-text-secondary hover:aucctus-bg-secondary-hover rounded px-4 py-2'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={!title.trim()}
          className='aucctus-bg-brand-primary aucctus-text-white hover:aucctus-bg-brand-primary-hover rounded px-4 py-2 disabled:opacity-50'
        >
          {isEdit ? 'Save Changes' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default React.memo(AddStepForm);
