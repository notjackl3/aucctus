import React, { FunctionComponent } from 'react';
import InputField from '../../../Input/InputField/InputField';

interface SourceFieldsProps {
  sourceTitle: string;
  sourceUrl: string;
  onSourceTitleChange: (value: string) => void;
  onSourceUrlChange: (value: string) => void;
  sourceTitleError?: string;
  sourceUrlError?: string;
  required?: boolean;
}

const SourceFields: FunctionComponent<SourceFieldsProps> = ({
  sourceTitle,
  sourceUrl,
  onSourceTitleChange,
  onSourceUrlChange,
  sourceTitleError,
  sourceUrlError,
  required,
}) => {
  return (
    <div className='flex flex-col'>
      <h5 className='aucctus-text-md-semibold mb-2'>
        Source
        {required && <span className='aucctus-text-error-primary ml-1'>*</span>}
      </h5>
      <div className='flex flex-row gap-3'>
        <span className='flex-1'>
          <InputField
            label='Citation'
            name='sourceCitation'
            value={sourceTitle}
            placeholder='Enter source citation'
            onChange={(e) => onSourceTitleChange(e.target.value)}
            errorMessage={sourceTitleError}
            required={required}
          />
        </span>
        <span className='flex-1'>
          <InputField
            label='URL'
            name='sourceUrl'
            value={sourceUrl}
            placeholder='Enter source URL'
            onChange={(e) => onSourceUrlChange(e.target.value)}
            errorMessage={sourceUrlError}
            required={required}
          />
        </span>
      </div>
    </div>
  );
};

export default SourceFields;
