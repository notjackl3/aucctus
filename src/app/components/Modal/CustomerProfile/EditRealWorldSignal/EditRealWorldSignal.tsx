import React, { FunctionComponent, useMemo, useState } from 'react';
import { useModal } from '@context/ModalContextProvider';
import styles from '../add-customer-profile.module.scss';
import {
  ICustomerProfileRealWorldSignal,
  ICreateRealWorldSignal,
  ISource,
} from '@libs/api/types';
import { Icon, toast } from '@components';
import {
  useCustomerProfileRealWorldSignalCreate,
  useCustomerProfileRealWorldSignalUpdate,
} from '@hooks/query/concepts.hook';
import utils from '@libs/utils';
import SignalForm from './SignalForm';
import { sourceCategories, stanceOptions } from './constants';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';

interface EditRealWorldSignalProps {
  signal?: ICustomerProfileRealWorldSignal;
  profileUuid?: string;
}

const EditRealWorldSignal: FunctionComponent<EditRealWorldSignalProps> = ({
  signal,
  profileUuid,
}) => {
  const { closeModal } = useModal();
  const [formData, setFormData] = useState({
    title: signal?.title || '',
    description: signal?.description || '',
    sourceCategory:
      signal?.sourceCategory ||
      ('First Party' as (typeof sourceCategories)[number]),
    stance: signal?.stance || ('Neutral' as (typeof stanceOptions)[number]),
    sourceTitle: signal?.sources?.[0]?.title || '',
    sourceUrl: signal?.sources?.[0]?.url || '',
  });

  const [errors, setErrors] = useState({
    title: undefined as string | undefined,
    description: undefined as string | undefined,
  });

  // Use the create mutation if no signal is provided (new signal)
  const { mutate: createSignal, isLoading: isCreating } =
    useCustomerProfileRealWorldSignalCreate();

  // Use the update mutation if a signal is provided (editing existing signal)
  const { mutate: updateSignal, isLoading: isUpdating } =
    useCustomerProfileRealWorldSignalUpdate();

  const isLoading = isCreating || isUpdating;

  const handleFormChange = (
    field: keyof typeof formData,
    value: string,
    error?: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'title' || field === 'description') {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSave = () => {
    if (!profileUuid) {
      toast.error('Profile UUID is required');
      return;
    }

    const {
      title,
      description,
      sourceCategory,
      stance,
      sourceTitle,
      sourceUrl,
    } = formData;

    if (!title || !description) {
      setErrors({
        title: !title ? 'Title is required.' : undefined,
        description: !description ? 'Description is required.' : undefined,
      });
      return;
    }

    // Prepare source data if citation is provided
    const updatedSources: Partial<ISource>[] = [];
    if (sourceTitle?.trim() && sourceUrl?.trim()) {
      updatedSources.push({
        title: sourceTitle.trim(),
        url: sourceUrl.trim(),
      });
    }

    const signalData: ICreateRealWorldSignal = {
      title,
      description,
      source_category: sourceCategory,
      stance,
      sources: updatedSources,
    };

    if (signal) {
      // Update existing signal
      updateSignal(
        {
          profileUuid,
          signalUuid: signal.uuid,
          signal: signalData,
        },
        {
          onSuccess: () => {
            toast.success('Real world signal updated successfully');
            closeModal();
          },
          onError: (error) => {
            const message = utils.osiris.parseFormError(error);
            toast.error(message || 'Failed to update real world signal');
          },
        },
      );
    } else {
      // Create new signal
      createSignal(
        {
          profileUuid,
          signalUuid: '', // This should be handled by the API
          signal: signalData,
        },
        {
          onSuccess: () => {
            toast.success('Real world signal created successfully');
            closeModal();
          },
          onError: (error) => {
            const message = utils.osiris.parseFormError(error);
            toast.error(message || 'Failed to create real world signal');
          },
        },
      );
    }
  };

  const header = useMemo(
    () => (
      <div className='relative mb-2 flex w-full flex-row items-center justify-between'>
        <span className='aucctus-text-primary aucctus-text-lg-medium'>
          Edit Signal
        </span>
        <span className='flex flex-1' />
        <button
          className='aucctus-bg-primary-hover aspect-square rounded-lg p-2'
          onClick={closeModal}
        >
          <Icon
            variant='closeX'
            className='aucctus-stroke-primary'
            height={16}
            width={16}
          />
        </button>
      </div>
    ),
    [closeModal],
  );

  return (
    <div className={styles.container}>
      {header}

      <SignalForm
        formData={formData}
        errors={errors}
        onChange={handleFormChange}
      />

      <div className={styles.footer}>
        <button className='btn btn-light' onClick={closeModal}>
          Cancel
        </button>
        <button
          className='btn btn-primary'
          disabled={
            !formData.title ||
            !formData.description ||
            !!errors.title ||
            !!errors.description ||
            isLoading
          }
          onClick={handleSave}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
      <LoadingMask isLoading={isLoading} />
    </div>
  );
};

export default EditRealWorldSignal;
