import { IBusinessModel, IFinancialMarketSizeItem, IFinancialProjectionPricing } from '@libs/api/types';
import { AxiosError } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { MutateOptions, UseMutateFunction } from 'react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  IConcept,
  IConceptOverview,
  ICustomerProfile,
  IFinancialProjection,
  IFormError,
  IMarketScan,
} from '../../../libs/api/types';
import { parseFormError } from '../../../libs/utils';
import {
  useConcept,
  useConceptCustomerProfile,
  useConceptMarketScan,
  useConceptOverview,
  useConceptOverviewUpdate,
  useConceptUpdate,
  useCustomerProfileUpdate,
  useFinancialProjection,
  useFinancialProjectionUpdate,
  // useMarketMetricSizeUpdate,
  useMarketScanUpdate,
} from '../query/concepts.hook';

interface EditableField<T, TData = unknown, TError = unknown, TVariables = unknown> {
  value: T;
  isEdited: boolean;
  validation: IValidationOptions;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | T) => void;
  handleSave: (options?: MutateOptions<TData, TError, TVariables>) => Promise<void>;
  handleCancel: () => void;
}

interface IValidationOptions {
  maxLength?: number;
}
interface EditableFieldOptions<T, TData = unknown, TError = unknown, TVariables = unknown> {
  initialValue: T;
  fieldName: keyof Exclude<Partial<TData>, 'uuid'>;
  updateMutation: UseMutateFunction<TData, TError, TVariables, unknown>;
  identifier: string;
  validation?: IValidationOptions;
}

type PartialWithUUid<T> = Partial<T> & { uuid: string };

/**
 * Custom hook for managing an editable field.
 *
 * @template T - The type of the field value.
 * @template TData - The type of the mutation data.
 * @template TError - The type of the mutation error.
 * @template TVariables - The type of the mutation variables.
 * @param {T} initialValue - The initial value of the field.
 * @param {keyof Exclude<TVariables, 'uuid'>} fieldName - The name of the field in the mutation variables.
 * @param {UseMutateFunction<TData, TError, TVariables, unknown>} mutate - The mutation function.
 * @param {string} identifier - The identifier for the mutation.
 * @param {number} [maxLength] - The maximum length of the field value.
 * @returns {EditableField<T, TData, TError, TVariables>} - An object containing the field value and various handlers.
 */
function useEditableField<
  T,
  TData = unknown,
  TError = AxiosError<IFormError<TData>>,
  TVariables = PartialWithUUid<TData>,
>({
  initialValue,
  fieldName,
  updateMutation,
  identifier,
  validation,
}: EditableFieldOptions<T, TData, TError, TVariables>): EditableField<T, TData, TError, TVariables> {
  const [value, setValue] = useState<T>(initialValue);
  const [isEdited, setIsEdited] = useState(false);

  const validationOptions = Object.assign({ maxLength: undefined }, validation || {}) as IValidationOptions;
  const { maxLength } = validationOptions;

  /**
   * Handles the change event for the editable value.
   *
   * @param {T} newValue - The new value to set.
   * @returns {void}
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | T) => {
    let newValue: T;

    if ((e as React.ChangeEvent<HTMLTextAreaElement>).target) {
      newValue = (e as React.ChangeEvent<HTMLTextAreaElement>).target.value as unknown as T;
    } else {
      newValue = e as T;
    }

    setValue(newValue);
    setIsEdited(true);
  }, []);

  /**
   * Saves the changes made to the editable field.
   *
   * @param {MutateOptions<TData, TError, TVariables>} options - Optional options for the mutation.
   * @returns {Promise<void>}
   */
  const handleSave = async (options?: MutateOptions<TData, TError, TVariables>): Promise<void> => {
    if (!identifier) {
      toast.error('Oops! Something went wrong. Please try again.');
    }

    if (!isEdited || !identifier) {
      return;
    }

    // Validate the field value
    if (maxLength && typeof value === 'string' && value.length > maxLength) {
      toast.error(`The maximum length is ${maxLength} characters`);
      return;
    }

    const input = { [fieldName]: value, uuid: identifier } as TVariables;
    updateMutation(input, {
      ...options,
      onError: (error, variables, context) => {
        const message = parseFormError(error);
        toast.error(message);
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
      onSuccess: (data, variables, context) => {
        toast.success('Updated successfully');
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

  return { value, handleChange, handleSave, isEdited, handleCancel, validation: validationOptions };
}

export function useEditConcept() {
  const { id: conceptUuid = '' } = useParams();
  const { concept } = useConcept(conceptUuid);
  const { mutate: updateConcept } = useConceptUpdate();

  const descriptionField = useEditableField<string, IConcept>({
    initialValue: concept?.description || '',
    fieldName: 'description',
    updateMutation: updateConcept,
    identifier: conceptUuid,
  });

  return {
    ...descriptionField,
  };
}

export function useEditOverview() {
  const { id: conceptUuid = '' } = useParams();
  const { overview } = useConceptOverview(conceptUuid);
  const { mutate: updateConceptOverview } = useConceptOverviewUpdate(conceptUuid);
  const validationOptions: IValidationOptions = { maxLength: 250 };

  const valueProposition = useEditableField<string, IConceptOverview>({
    initialValue: overview?.valueProposition || '',
    fieldName: 'valueProposition',
    updateMutation: updateConceptOverview,
    identifier: overview?.uuid || '',
    validation: validationOptions,
  });

  const problemStatement = useEditableField<string, IConceptOverview>({
    initialValue: overview?.problemStatement || '',
    fieldName: 'problemStatement',
    updateMutation: updateConceptOverview,
    identifier: overview?.uuid || '',
    validation: validationOptions,
  });

  return {
    problemStatement,
    valueProposition,
  };
}

export function useEditMarketScan() {
  const { id: conceptUuid = '' } = useParams();
  const { marketScan } = useConceptMarketScan(conceptUuid);
  const { mutate } = useMarketScanUpdate(conceptUuid);
  const validationOptions: IValidationOptions = { maxLength: 500 };

  const trendsAndDriversDescription = useEditableField<string, IMarketScan>({
    initialValue: marketScan?.trendsAndDriversDescription || '',
    fieldName: 'trendsAndDriversDescription',
    updateMutation: mutate,
    identifier: marketScan?.uuid || '',
    validation: validationOptions,
  });

  const ecosystemDescription = useEditableField<string, IMarketScan>({
    initialValue: marketScan?.ecosystemDescription || '',
    fieldName: 'ecosystemDescription',
    updateMutation: mutate,
    identifier: marketScan?.uuid || '',
    validation: validationOptions,
  });

  return {
    trendsAndDriversDescription,
    ecosystemDescription,
  };
}

// TODO: Handle Editing

const DEFAULT_BUSINESS_MODEL: IBusinessModel = {
  modelName: '',
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
  const { id: conceptUuid = '' } = useParams();
  const { financialProjection, isLoading } = useFinancialProjection(conceptUuid);
  const { mutate } = useFinancialProjectionUpdate(conceptUuid);
  const validationOptions: IValidationOptions = { maxLength: 500 };

  const overview = useEditableField<string, IFinancialProjection>({
    initialValue: financialProjection?.overview || '',
    fieldName: 'overview',
    updateMutation: mutate,
    identifier: financialProjection?.uuid || '',
    validation: validationOptions,
  });

  const tam = useEditableField<number, IFinancialProjection>({
    initialValue: financialProjection?.tam || 0,
    fieldName: 'tam',
    updateMutation: mutate,
    identifier: financialProjection?.uuid || '',
    validation: validationOptions,
  });

  const sam = useEditableField<number, IFinancialProjection>({
    initialValue: financialProjection?.sam || 0,
    fieldName: 'sam',
    updateMutation: mutate,
    identifier: financialProjection?.uuid || '',
    validation: validationOptions,
  });

  const som = useEditableField<number, IFinancialProjection>({
    initialValue: financialProjection?.som || 0,
    fieldName: 'som',
    updateMutation: mutate,
    identifier: financialProjection?.uuid || '',
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
    serviceableAddressablePercent: financialProjection?.serviceableAddressablePercent || DEFAULT_MARKET_SIZE,
    serviceableObtainablePercent: financialProjection?.serviceableObtainablePercent || DEFAULT_MARKET_SIZE,
  };
}

export function useEditCustomerProfile(profileUuid: string) {
  const { id: conceptUuid = undefined } = useParams();
  const { profile } = useConceptCustomerProfile(profileUuid);
  const { mutate } = useCustomerProfileUpdate(profileUuid, conceptUuid);

  const validationOptions: IValidationOptions = { maxLength: 2500 };

  // const name = useEditableField<string, ICustomerProfile>({
  //   initialValue: profile?.name || '',
  //   fieldName: 'name',
  //   updateMutation: mutate,
  //   identifier: profileUuid,
  //   validation: validationOptions,
  // });

  // const nickname = useEditableField<string, ICustomerProfile>({
  //   initialValue: profile?.nickname || '',
  //   fieldName: 'nickname',
  //   updateMutation: mutate,
  //   identifier: profileUuid,
  //   validation: validationOptions,
  // });

  const description = useEditableField<string, ICustomerProfile>({
    initialValue: profile?.description || '',
    fieldName: 'description',
    updateMutation: mutate,
    identifier: profileUuid,
    validation: validationOptions,
  });

  return {
    description,
  };
}
