import { toast } from '@components';
import useStore from '@stores/store';
import {
  IBusinessModel,
  IFinancialMarketSizeItem,
  IFinancialProjectionPricing,
  IMarketScan,
} from '@libs/api/types';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MutateOptions, UseMutateFunction } from 'react-query';
import {
  IConcept,
  ICustomerProfile,
  IFinancialProjection,
  IFormError,
} from '../../../libs/api/types';
import {
  useConcept,
  useConceptCustomerProfile,
  useConceptMarketScan,
  useConceptUpdate,
  useCustomerProfileUpdate,
  useFinancialProjection,
  useFinancialProjectionUpdate,
  // useMarketMetricSizeUpdate,
  useMarketScanUpdate,
} from '../query/concepts.hook';

interface EditableField<
  T,
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
> {
  value: T;
  isEdited: boolean;
  validation: IValidationOptions;
  handleChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | T,
  ) => void;
  handleSave: (
    options?: MutateOptions<TData, TError, TVariables>,
  ) => Promise<void>;
  handleCancel: () => void;
}

interface IValidationOptions {
  maxLength?: number;
}
interface EditableFieldOptions<
  T,
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
> {
  initialValue: T;
  fieldName: keyof Exclude<Partial<TData>, 'uuid' | 'identifier'>;
  updateMutation: UseMutateFunction<TData, TError, TVariables, unknown>;
  identifier?: string;
  uuid?: string;
  validation?: IValidationOptions;
}

// Define more specific types for the different API requirements
type PartialWithIdentifier<T> = Partial<T> & { identifier: string };
type PartialWithUuid<T> = Partial<T> & { uuid: string };

/**
 * Custom hook for managing an editable field.
 * This hook is designed to work with different API mutation patterns, supporting:
 * - Objects that require an identifier property
 * - Objects that require a uuid property
 * - Objects that can work with either identifier or uuid
 *
 * @template T - The type of the field value.
 * @template TData - The type of the mutation data.
 * @template TError - The type of the mutation error.
 * @template TVariables - The type of the mutation variables.
 * @param {EditableFieldOptions<T, TData, TError, TVariables>} options - The options for the editable field.
 * @param {T} options.initialValue - The initial value of the field.
 * @param {keyof Exclude<Partial<TData>, 'uuid' | 'identifier'>} options.fieldName - The name of the field in the mutation variables.
 * @param {UseMutateFunction<TData, TError, TVariables, unknown>} options.updateMutation - The mutation function.
 * @param {string} [options.identifier] - The identifier for the mutation (used for some APIs).
 * @param {string} [options.uuid] - The UUID for the mutation (used for some APIs).
 * @param {IValidationOptions} [options.validation] - Validation options for the field.
 * @returns {EditableField<T, TData, TError, TVariables>} - An object containing the field value and various handlers.
 */
function useEditableField<
  T,
  TData = unknown,
  TError = AxiosError<IFormError<TData>>,
  TVariables = any,
>({
  initialValue,
  fieldName,
  updateMutation,
  identifier,
  uuid,
  validation,
}: EditableFieldOptions<T, TData, TError, TVariables>): EditableField<
  T,
  TData,
  TError,
  TVariables
> {
  const [value, setValue] = useState<T>(initialValue);
  const [isEdited, setIsEdited] = useState(false);

  const validationOptions = Object.assign(
    { maxLength: undefined },
    validation || {},
  ) as IValidationOptions;
  const { maxLength } = validationOptions;

  /**
   * Handles the change event for the editable value.
   *
   * @param {T} newValue - The new value to set.
   * @returns {void}
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | T) => {
      let newValue: T;

      if ((e as React.ChangeEvent<HTMLTextAreaElement>).target) {
        newValue = (e as React.ChangeEvent<HTMLTextAreaElement>).target
          .value as unknown as T;
      } else {
        newValue = e as T;
      }

      setValue(newValue);
      setIsEdited(true);
    },
    [],
  );

  /**
   * Saves the changes made to the editable field.
   *
   * @param {MutateOptions<TData, TError, TVariables>} options - Optional options for the mutation.
   * @returns {Promise<void>}
   */
  const handleSave = async (
    options?: MutateOptions<TData, TError, TVariables>,
  ): Promise<void> => {
    if (!identifier && !uuid) {
      toast.error('Update Failed', 'Something went wrong. Please try again');
      return;
    }

    if (!isEdited) {
      return;
    }

    // Validate the field value
    if (maxLength && typeof value === 'string' && value.length > maxLength) {
      toast.error(
        'Validation Error',
        `The maximum length is ${maxLength} characters`,
      );
      return;
    }

    // Create input object based on which identifier is available
    const input = {
      [fieldName]: value,
    } as any;

    // Only add properties that are provided
    if (uuid) {
      input.uuid = uuid;
    }
    if (identifier) {
      input.identifier = identifier;
    }

    updateMutation(input, {
      ...options,
      onError: (error, variables, context) => {
        const message = utils.osiris.parseFormError(error);
        toast.error(
          'Update Failed',
          message || 'Unable to save changes. Please try again',
        );
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
      onSuccess: (data, variables, context) => {
        toast.success('Updated', 'Your changes have been saved successfully');
        setIsEdited(false);
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
    });
  };

  /**
   * Cancels the changes made to the editable field.
   *
   * @returns {void}
   */
  const handleCancel = useCallback((): void => {
    setValue(initialValue);
    setIsEdited(false);
  }, [initialValue]);

  useEffect(() => {
    if (isEdited) return;
    setValue(initialValue);
    setIsEdited(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  return {
    value,
    handleChange,
    handleSave,
    isEdited,
    handleCancel,
    validation: validationOptions,
  };
}

export function useEditConcept() {
  const activeConceptIdentifier = useStore(
    (state) => state.conceptReport.identifier,
  );
  const conceptIdentifier = useMemo(
    () => activeConceptIdentifier ?? '',
    [activeConceptIdentifier],
  );
  const { concept } = useConcept(conceptIdentifier);
  const { mutate: updateConcept } = useConceptUpdate();
  const validationOptions: IValidationOptions = { maxLength: 250 };

  const titleField = useEditableField<
    string,
    IConcept,
    AxiosError<IFormError<IConcept>>,
    PartialWithIdentifier<IConcept>
  >({
    initialValue: concept?.title || '',
    fieldName: 'title',
    updateMutation: updateConcept,
    identifier: conceptIdentifier,
  });

  const summaryField = useEditableField<
    string,
    IConcept,
    AxiosError<IFormError<IConcept>>,
    PartialWithIdentifier<IConcept>
  >({
    initialValue: concept?.summary || '',
    fieldName: 'summary',
    updateMutation: updateConcept,
    identifier: conceptIdentifier,
  });

  const overviewField = useEditableField<
    string,
    IConcept,
    AxiosError<IFormError<IConcept>>,
    PartialWithIdentifier<IConcept>
  >({
    initialValue: concept?.overview || '',
    fieldName: 'overview',
    updateMutation: updateConcept,
    identifier: conceptIdentifier,
  });

  const valueProposition = useEditableField<
    string,
    IConcept,
    AxiosError<IFormError<IConcept>>,
    PartialWithIdentifier<IConcept>
  >({
    initialValue: concept?.valueProposition || '',
    fieldName: 'valueProposition',
    updateMutation: updateConcept,
    identifier: conceptIdentifier,
    validation: validationOptions,
  });

  const problemStatement = useEditableField<
    string,
    IConcept,
    AxiosError<IFormError<IConcept>>,
    PartialWithIdentifier<IConcept>
  >({
    initialValue: concept?.problemStatement || '',
    fieldName: 'problemStatement',
    updateMutation: updateConcept,
    identifier: concept?.identifier || '',
    validation: validationOptions,
  });

  return {
    title: titleField,
    summary: summaryField,
    overview: overviewField,
    valueProposition,
    problemStatement,
  };
}

export function useEditMarketScan() {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );
  const conceptUuid = useMemo(
    () => activeConceptUuid ?? '',
    [activeConceptUuid],
  );
  const { marketScan } = useConceptMarketScan(conceptUuid);
  const { mutate } = useMarketScanUpdate(conceptUuid);
  const validationOptions: IValidationOptions = { maxLength: 500 };

  const trendsAndDriversDescription = useEditableField<
    string,
    IMarketScan,
    AxiosError<IFormError<IMarketScan>>,
    PartialWithUuid<IMarketScan>
  >({
    initialValue: marketScan?.trendsAndDriversDescription || '',
    fieldName: 'trendsAndDriversDescription',
    updateMutation: mutate,
    uuid: marketScan?.uuid || '',
    validation: validationOptions,
  });

  const ecosystemDescription = useEditableField<
    string,
    IMarketScan,
    AxiosError<IFormError<IMarketScan>>,
    PartialWithUuid<IMarketScan>
  >({
    initialValue: marketScan?.ecosystemDescription || '',
    fieldName: 'ecosystemDescription',
    updateMutation: mutate,
    uuid: marketScan?.uuid || '',
    validation: validationOptions,
  });

  return {
    trendsAndDriversDescription,
    ecosystemDescription,
  };
}

// TODO: Handle Editing

const DEFAULT_BUSINESS_MODEL: IBusinessModel = {
  name: '',
  description: '',
  rationale: '',
  uuid: '',
  version: 0,
  createdAt: '',
  updatedAt: '',
  sources: [],
};

const DEFAULT_PRICING: IFinancialProjectionPricing = {
  price: 0,
  billing: '',
  averageRevenuePerCustomer: 0,
  purchasingFrequency: 0,
  rationale: '',
  sources: [],
  uuid: '',
  version: 0,
  createdAt: '',
  updatedAt: '',
};

const DEFAULT_MARKET_SIZE: IFinancialMarketSizeItem = {
  value: 0,
  assumptions: [],
  rationale: '',
  sources: [],
  uuid: '',
  version: 0,
  createdAt: '',
  updatedAt: '',
};
export function useEditFinancialProjections() {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );
  const conceptUuid = useMemo(
    () => activeConceptUuid ?? '',
    [activeConceptUuid],
  );
  const { financialProjection, isLoading } =
    useFinancialProjection(conceptUuid);
  const { mutate } = useFinancialProjectionUpdate(conceptUuid);
  const validationOptions: IValidationOptions = { maxLength: 2500 };

  const overview = useEditableField<
    string,
    IFinancialProjection,
    AxiosError<IFormError<IFinancialProjection>>,
    PartialWithUuid<IFinancialProjection>
  >({
    initialValue: financialProjection?.overview || '',
    fieldName: 'overview',
    updateMutation: mutate,
    uuid: financialProjection?.uuid || '',
    validation: validationOptions,
  });

  const tam = useEditableField<
    number,
    IFinancialProjection,
    AxiosError<IFormError<IFinancialProjection>>,
    PartialWithUuid<IFinancialProjection>
  >({
    initialValue: financialProjection?.tam || 0,
    fieldName: 'tam',
    updateMutation: mutate,
    uuid: financialProjection?.uuid || '',
    validation: validationOptions,
  });

  const sam = useEditableField<
    number,
    IFinancialProjection,
    AxiosError<IFormError<IFinancialProjection>>,
    PartialWithUuid<IFinancialProjection>
  >({
    initialValue: financialProjection?.sam || 0,
    fieldName: 'sam',
    updateMutation: mutate,
    uuid: financialProjection?.uuid || '',
    validation: validationOptions,
  });

  const som = useEditableField<
    number,
    IFinancialProjection,
    AxiosError<IFormError<IFinancialProjection>>,
    PartialWithUuid<IFinancialProjection>
  >({
    initialValue: financialProjection?.som || 0,
    fieldName: 'som',
    updateMutation: mutate,
    uuid: financialProjection?.uuid || '',
    validation: validationOptions,
  });

  return {
    isLoading: isLoading,
    overview,
    tam,
    sam,
    som,

    // TODO: Clean this all up and enable editing
    businessModel: financialProjection?.businessModel || DEFAULT_BUSINESS_MODEL,
    pricing: financialProjection?.pricing || DEFAULT_PRICING,
    totalUsers: financialProjection?.totalUsers || DEFAULT_MARKET_SIZE,
    serviceableAddressablePercent:
      financialProjection?.serviceableAddressablePercent || DEFAULT_MARKET_SIZE,
    serviceableObtainablePercent:
      financialProjection?.serviceableObtainablePercent || DEFAULT_MARKET_SIZE,
  };
}

export function useEditCustomerProfile(profileUuid: string) {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );
  const conceptUuid = useMemo(
    () => activeConceptUuid ?? '',
    [activeConceptUuid],
  );
  const { profile, isLoading } = useConceptCustomerProfile(profileUuid);
  const { mutate } = useCustomerProfileUpdate(profileUuid, conceptUuid);

  const validationOptions: IValidationOptions = { maxLength: 2500 };

  // const name = useEditableField<string, ICustomerProfile>({
  //   initialValue: profile?.name || '',
  //   fieldName: 'name',
  //   updateMutation: mutate,
  //   uuid: profileUuid,
  //   validation: validationOptions,
  // });

  // const segment = useEditableField<string, ICustomerProfile>({
  //   initialValue: profile?.segment || '',
  //   fieldName: 'segment',
  //   updateMutation: mutate,
  //   uuid: profileUuid,
  //   validation: validationOptions,
  // });

  const description = useEditableField<
    string,
    ICustomerProfile,
    AxiosError<IFormError<ICustomerProfile>>,
    PartialWithUuid<ICustomerProfile>
  >({
    initialValue: profile?.description || '',
    fieldName: 'description',
    updateMutation: mutate,
    uuid: profileUuid,
    validation: validationOptions,
  });

  return {
    description,
    isLoading,
  };
}
