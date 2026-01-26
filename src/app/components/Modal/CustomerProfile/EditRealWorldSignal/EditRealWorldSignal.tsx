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
import { SourceInput, SourceErrors } from './MultiSourceFields';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';

// Convert API sources to form sources
const toSourceInputs = (sources?: ISource[]): SourceInput[] => {
  if (!sources || sources.length === 0) {
    return [{ id: `new-${Date.now()}`, title: '', url: '' }];
  }
  return sources.map((source) => ({
    id: source.uuid || `existing-${Date.now()}-${Math.random()}`,
    title: source.title || '',
    url: source.url || '',
  }));
};

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
    sources: toSourceInputs(signal?.sources),
  });

  const [errors, setErrors] = useState<{
    description?: string;
    sourceCategory?: string;
    stance?: string;
    sources: Record<string, SourceErrors>;
  }>({
    description: undefined,
    sourceCategory: undefined,
    stance: undefined,
    sources: {},
  });

  // Use the create mutation if no signal is provided (new signal)
  const { mutate: createSignal, isLoading: isCreating } =
    useCustomerProfileRealWorldSignalCreate();

  // Use the update mutation if a signal is provided (editing existing signal)
  const { mutate: updateSignal, isLoading: isUpdating } =
    useCustomerProfileRealWorldSignalUpdate();

  const isLoading = isCreating || isUpdating;

  const handleFieldChange = (
    field: 'description' | 'sourceCategory' | 'stance',
    value: string,
    error?: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSourcesChange = (
    sources: SourceInput[],
    sourceErrors: Record<string, SourceErrors>,
  ) => {
    setFormData((prev) => ({ ...prev, sources }));
    setErrors((prev) => ({ ...prev, sources: sourceErrors }));
  };

  const validateForm = () => {
    // Validate basic fields
    const fieldErrors = {
      description: !formData.description
        ? 'Description is required.'
        : undefined,
      sourceCategory: !formData.sourceCategory
        ? 'Source category is required.'
        : undefined,
      stance: !formData.stance ? 'Stance is required.' : undefined,
    };

    // Validate sources
    const sourceErrors: Record<string, SourceErrors> = {};
    let hasSourceError = false;

    formData.sources.forEach((source) => {
      const titleError = !source.title.trim()
        ? 'Source title is required.'
        : undefined;
      const urlError = !source.url.trim()
        ? 'Source URL is required.'
        : undefined;

      if (titleError || urlError) {
        hasSourceError = true;
        sourceErrors[source.id] = { title: titleError, url: urlError };
      }
    });

    // Must have at least one source
    if (formData.sources.length === 0) {
      hasSourceError = true;
    }

    const newErrors = {
      ...fieldErrors,
      sources: sourceErrors,
    };

    setErrors(newErrors);

    const hasFieldError = Object.values(fieldErrors).some(
      (error) => error !== undefined,
    );

    return !hasFieldError && !hasSourceError;
  };

  const handleSave = () => {
    if (!profileUuid) {
      toast.error(
        'Profile UUID Required',
        'Profile UUID is required to continue',
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    const { description, sourceCategory, stance, sources } = formData;

    // Prepare source data
    const updatedSources: Partial<ISource>[] = sources.map((source) => ({
      title: source.title.trim(),
      url: source.url.trim(),
    }));

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
            toast.success(
              'Signal Updated',
              'Real world signal updated successfully',
            );
            closeModal();
          },
          onError: (error) => {
            const message = utils.osiris.parseFormError(error);
            toast.error(
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
            toast.success(
              'Signal Created',
              'Real world signal created successfully',
            );
            closeModal();
          },
          onError: (error) => {
            const message = utils.osiris.parseFormError(error);
            toast.error(
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
    const hasRequiredFields =
      formData.description &&
      formData.sourceCategory &&
      formData.stance &&
      formData.sources.length > 0;

    const allSourcesValid = formData.sources.every(
      (source) => source.title.trim() && source.url.trim(),
    );

    const hasFieldErrors =
      errors.description ||
      errors.sourceCategory ||
      errors.stance ||
      Object.values(errors.sources).some((e) => e.title || e.url);

    return hasRequiredFields && allSourcesValid && !hasFieldErrors;
  }, [formData, errors]);

  return (
    <div className={styles.container}>
      {header}

      <SignalForm
        formData={formData}
        errors={errors}
        onFieldChange={handleFieldChange}
        onSourcesChange={handleSourcesChange}
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
