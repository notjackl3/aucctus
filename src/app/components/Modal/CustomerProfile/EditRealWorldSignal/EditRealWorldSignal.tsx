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
    description: signal?.description || '',
    sourceCategory: signal?.sourceCategory,
    stance: signal?.stance,
    sourceTitle: signal?.sources?.[0]?.title || '',
    sourceUrl: signal?.sources?.[0]?.url || '',
  });

  const [errors, setErrors] = useState({
    description: undefined as string | undefined,
    sourceCategory: undefined as string | undefined,
    stance: undefined as string | undefined,
    sourceTitle: undefined as string | undefined,
    sourceUrl: undefined as string | undefined,
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
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const newErrors = {
      description: !formData.description
        ? 'Description is required.'
        : undefined,
      sourceCategory: !formData.sourceCategory
        ? 'Source category is required.'
        : undefined,
      stance: !formData.stance ? 'Stance is required.' : undefined,
      sourceTitle: !formData.sourceTitle
        ? 'Source title is required.'
        : undefined,
      sourceUrl: !formData.sourceUrl ? 'Source URL is required.' : undefined,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleSave = () => {
    if (!profileUuid) {
      toast.errorAnimated(
        'Profile UUID Required',
        'Profile UUID is required to continue',
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    const { description, sourceCategory, stance, sourceTitle, sourceUrl } =
      formData;

    // Prepare source data
    const updatedSources: Partial<ISource>[] = [
      {
        title: sourceTitle.trim(),
        url: sourceUrl.trim(),
      },
    ];

    const signalData: ICreateRealWorldSignal = {
      description,
      sourceCategory: sourceCategory!,
      stance: stance!,
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
            toast.successAnimated(
              'Signal Updated',
              'Real world signal updated successfully',
            );
            closeModal();
          },
          onError: (error) => {
            const message = utils.osiris.parseFormError(error);
            toast.errorAnimated(
              'Signal Update Failed',
              message || 'Failed to update real world signal',
            );
          },
        },
      );
    } else {
      // Create new signal
      createSignal(
        {
          profileUuid,
          signal: signalData,
        },
        {
          onSuccess: () => {
            toast.successAnimated(
              'Signal Created',
              'Real world signal created successfully',
            );
            closeModal();
          },
          onError: (error) => {
            const message = utils.osiris.parseFormError(error);
            toast.errorAnimated(
              'Signal Creation Failed',
              message || 'Failed to create real world signal',
            );
          },
        },
      );
    }
  };

  const header = useMemo(
    () => (
      <div className='relative mb-2 flex w-full flex-row items-center justify-between'>
        <span className='aucctus-text-primary aucctus-text-lg-medium'>
          {signal ? 'Edit Signal' : 'Create Signal'}
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
    [closeModal, signal],
  );

  const isFormValid = useMemo(() => {
    return (
      formData.description &&
      formData.sourceCategory &&
      formData.stance &&
      formData.sourceTitle &&
      formData.sourceUrl &&
      !Object.values(errors).some((error) => error !== undefined)
    );
  }, [formData, errors]);

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
          disabled={!isFormValid || isLoading}
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
