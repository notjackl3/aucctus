import { IPropertyDefinition } from '@libs/api/types';
import React from 'react';

interface INumberPropertyCellProps {
  editValue: any;
  definition: IPropertyDefinition;
  onEditValueChange: (value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Number property cell component for inline editing
 */
export const NumberPropertyCell: React.FC<INumberPropertyCellProps> = ({
  editValue,
  definition,
  onEditValueChange,
  onSave,
  onCancel,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      type='number'
      value={editValue || ''}
      onChange={(e) =>
        onEditValueChange(e.target.valueAsNumber || e.target.value)
      }
      onKeyDown={handleKeyDown}
      onBlur={onSave}
      onClick={(e) => e.stopPropagation()}
      min={definition.config.min}
      max={definition.config.max}
      className='aucctus-bg-primary aucctus-border-brand aucctus-text-primary w-full rounded border-2 px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
      placeholder={`Enter ${definition.name}...`}
      autoFocus
    />
  );
};
