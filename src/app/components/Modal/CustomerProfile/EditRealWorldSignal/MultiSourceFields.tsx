import React, { FunctionComponent, useCallback } from 'react';
import { Input } from '@components';
import { cn } from '@libs/utils/react';
import { Plus, Trash2 } from 'lucide-react';

export interface SourceInput {
  id: string;
  title: string;
  url: string;
}

export interface SourceErrors {
  title?: string;
  url?: string;
}

interface MultiSourceFieldsProps {
  sources: SourceInput[];
  errors: Record<string, SourceErrors>;
  onChange: (
    sources: SourceInput[],
    errors: Record<string, SourceErrors>,
  ) => void;
  minSources?: number;
  maxSources?: number;
}

const MultiSourceFields: FunctionComponent<MultiSourceFieldsProps> = ({
  sources,
  errors,
  onChange,
  minSources = 1,
  maxSources = 5,
}) => {
  const validateField = useCallback(
    (value: string, fieldName: string): string | undefined => {
      if (!value.trim()) {
        return `${fieldName} is required.`;
      }
      return undefined;
    },
    [],
  );

  const handleFieldChange = useCallback(
    (sourceId: string, field: 'title' | 'url', value: string) => {
      const fieldDisplayName =
        field === 'title' ? 'Source title' : 'Source URL';
      const error = validateField(value, fieldDisplayName);

      const updatedSources = sources.map((source) =>
        source.id === sourceId ? { ...source, [field]: value } : source,
      );

      const updatedErrors = {
        ...errors,
        [sourceId]: {
          ...errors[sourceId],
          [field]: error,
        },
      };

      onChange(updatedSources, updatedErrors);
    },
    [sources, errors, onChange, validateField],
  );

  const addSource = useCallback(() => {
    if (sources.length >= maxSources) return;

    const newSource: SourceInput = {
      id: `new-${Date.now()}`,
      title: '',
      url: '',
    };

    onChange([...sources, newSource], errors);
  }, [sources, errors, onChange, maxSources]);

  const removeSource = useCallback(
    (sourceId: string) => {
      if (sources.length <= minSources) return;

      const updatedSources = sources.filter((source) => source.id !== sourceId);
      const { [sourceId]: _removed, ...remainingErrors } = errors;
      void _removed; // Intentionally unused - we're just extracting and discarding this key

      onChange(updatedSources, remainingErrors);
    },
    [sources, errors, onChange, minSources],
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-row items-center justify-between'>
        <h5 className='aucctus-text-md-semibold'>
          Sources
          <span className='aucctus-text-error-primary ml-1'>*</span>
        </h5>
        {sources.length < maxSources && (
          <button
            type='button'
            onClick={addSource}
            className='aucctus-text-brand-primary aucctus-text-sm flex items-center gap-1 hover:underline'
          >
            <Plus className='aucctus-stroke-brand-primary h-4 w-4' />
            Add Source
          </button>
        )}
      </div>

      <div className='flex flex-col gap-3'>
        {sources.map((source, index) => (
          <div
            key={source.id}
            className={cn(
              'flex flex-col gap-2 rounded-lg border p-3',
              'aucctus-border-secondary aucctus-bg-secondary',
            )}
          >
            <div className='flex flex-row items-center justify-between'>
              <span className='aucctus-text-xs-medium aucctus-text-secondary'>
                Source {index + 1}
              </span>
              {sources.length > minSources && (
                <button
                  type='button'
                  onClick={() => removeSource(source.id)}
                  className='aucctus-text-error-primary aucctus-text-xs flex items-center gap-1 hover:underline'
                >
                  <Trash2 className='aucctus-stroke-error-primary h-3 w-3' />
                  Remove
                </button>
              )}
            </div>
            <div className='flex flex-row gap-3'>
              <span className='flex-1'>
                <Input.Field
                  label='Citation'
                  name={`sourceCitation-${source.id}`}
                  value={source.title}
                  placeholder='Enter source citation'
                  onChange={(e) =>
                    handleFieldChange(source.id, 'title', e.target.value)
                  }
                  errorMessage={errors[source.id]?.title}
                  required
                />
              </span>
              <span className='flex-1'>
                <Input.Field
                  label='URL'
                  name={`sourceUrl-${source.id}`}
                  value={source.url}
                  placeholder='Enter source URL'
                  onChange={(e) =>
                    handleFieldChange(source.id, 'url', e.target.value)
                  }
                  errorMessage={errors[source.id]?.url}
                  required
                />
              </span>
            </div>
          </div>
        ))}
      </div>

      {sources.length >= maxSources && (
        <p className='aucctus-text-xs aucctus-text-secondary'>
          Maximum of {maxSources} sources reached.
        </p>
      )}
    </div>
  );
};

export default MultiSourceFields;
