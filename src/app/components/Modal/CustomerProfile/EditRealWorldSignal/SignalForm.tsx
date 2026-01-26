import React, { FunctionComponent, useCallback } from 'react';
import TextArea from '../../../Input/TextArea/TextArea';
import { sourceCategories, stanceOptions } from './constants';
import CategorySelect from '../CategorySelect';
import MultiSourceFields, {
  SourceInput,
  SourceErrors,
} from './MultiSourceFields';
import { SignalSourceCategoryType, SignalStanceType } from '@libs/api/types';

interface FormData {
  description?: string;
  sourceCategory?: SignalSourceCategoryType;
  stance?: SignalStanceType;
  sources: SourceInput[];
}

interface FormErrors {
  description?: string;
  sourceCategory?: string;
  stance?: string;
  sources: Record<string, SourceErrors>;
}

interface SignalFormProps {
  formData: FormData;
  errors: FormErrors;
  onFieldChange: (
    field: 'description' | 'sourceCategory' | 'stance',
    value: string,
    error?: string,
  ) => void;
  onSourcesChange: (
    sources: SourceInput[],
    errors: Record<string, SourceErrors>,
  ) => void;
}

const SignalForm: FunctionComponent<SignalFormProps> = ({
  formData,
  errors,
  onFieldChange,
  onSourcesChange,
}) => {
  const handleTextFieldChange = useCallback(
    (
      fieldName: 'description' | 'sourceCategory' | 'stance',
      displayName: string,
      maxLength?: number,
    ) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const input = e.target.value;
        let error: string | undefined = undefined;

        if (input.length === 0) {
          error = `${displayName} is required.`;
        } else if (maxLength && input.length > maxLength) {
          error = `${displayName} exceeds the maximum allowed length.`;
        }

        onFieldChange(fieldName, input, error);
      },
    [onFieldChange],
  );

  const handleSelectChange = useCallback(
    (fieldName: 'sourceCategory' | 'stance', displayName: string) =>
      (value: string) => {
        const error = !value ? `${displayName} is required.` : undefined;
        onFieldChange(fieldName, value, error);
      },
    [onFieldChange],
  );

  return (
    <div className='flex flex-col gap-4'>
      <TextArea
        label='Description'
        name='description'
        placeholder='Required...'
        value={formData.description}
        rows={4}
        maxLength={500}
        errorMessage={errors.description}
        onChange={handleTextFieldChange('description', 'Description', 500)}
        required
      />

      <CategorySelect
        label='Source Category'
        selectedValue={formData.sourceCategory || ''}
        options={sourceCategories}
        onChange={handleSelectChange('sourceCategory', 'Source category')}
        errorMessage={errors.sourceCategory}
        required
      />

      <CategorySelect
        label='Stance'
        selectedValue={formData.stance || ''}
        options={stanceOptions}
        onChange={handleSelectChange('stance', 'Stance')}
        errorMessage={errors.stance}
        required
      />

      <MultiSourceFields
        sources={formData.sources}
        errors={errors.sources}
        onChange={onSourcesChange}
      />
    </div>
  );
};

export default SignalForm;
