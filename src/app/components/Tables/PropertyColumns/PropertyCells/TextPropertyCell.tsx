import { IPropertyDefinition } from '@libs/api/types';
import React from 'react';

interface ITextPropertyCellProps {
  editValue: any;
  definition: IPropertyDefinition;
  onEditValueChange: (value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Text property cell component for inline editing
 */
export const TextPropertyCell: React.FC<ITextPropertyCellProps> = ({
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
      type='text'
      value={editValue || ''}
      onChange={(e) => onEditValueChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={onSave}
      onClick={(e) => e.stopPropagation()}
      className='aucctus-bg-primary aucctus-border-brand aucctus-text-primary w-full rounded border-2 px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
      placeholder={`Enter ${definition.name}...`}
      autoFocus
    />
  );
};
