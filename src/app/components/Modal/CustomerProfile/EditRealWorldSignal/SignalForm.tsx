import React, { FunctionComponent, useCallback } from 'react';
import TextArea from '../../../Input/TextArea/TextArea';
import { sourceCategories, stanceOptions } from './constants';
import CategorySelect from '../CategorySelect';
import SourceFields from './SourceFields';
import { SignalSourceCategoryType, SignalStanceType } from '@libs/api/types';

interface FormData {
  description?: string;
  sourceCategory?: SignalSourceCategoryType;
  stance?: SignalStanceType;
  sourceTitle?: string;
  sourceUrl?: string;
}

interface FormErrors {
  description?: string;
  sourceCategory?: string;
  stance?: string;
  sourceTitle?: string;
  sourceUrl?: string;
}

interface SignalFormProps {
  formData: FormData;
  errors: FormErrors;
  onChange: (field: keyof FormData, value: string, error?: string) => void;
}

const SignalForm: FunctionComponent<SignalFormProps> = ({
  formData,
  errors,
  onChange,
}) => {
  const handleTextFieldChange = useCallback(
    (
      fieldName: 'description' | 'sourceTitle' | 'sourceUrl',
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

        onChange(fieldName, input, error);
      },
    [onChange],
  );

  const handleSelectChange = useCallback(
    (fieldName: 'sourceCategory' | 'stance', displayName: string) =>
      (value: string) => {
        const error = !value ? `${displayName} is required.` : undefined;
        onChange(fieldName, value, error);
      },
    [onChange],
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

      <SourceFields
        sourceTitle={formData.sourceTitle || ''}
        sourceUrl={formData.sourceUrl || ''}
        onSourceTitleChange={(value) =>
          handleTextFieldChange(
            'sourceTitle',
            'Source title',
          )({ target: { value } } as any)
        }
        onSourceUrlChange={(value) =>
          handleTextFieldChange(
            'sourceUrl',
            'Source URL',
          )({ target: { value } } as any)
        }
        sourceTitleError={errors.sourceTitle}
        sourceUrlError={errors.sourceUrl}
        required
      />
    </div>
  );
};

export default SignalForm;
