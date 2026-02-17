import React from 'react';
import { Input, Button } from '@components';
import { Check, X } from 'lucide-react';
import LoadingSpinner from '@components/Icon/LoadingSpinner';

/**
 * Props for AddItemForm
 * @param value - The current value of the input
 * @param onChange - Handler for input change
 * @param onAdd - Handler for add action (called on button click or Enter)
 * @param onCancel - Handler for cancel action
 * @param loading - Whether the add action is loading
 * @param itemLabel - Label for the item being added
 */
export interface AddItemFormProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  onCancel: () => void;
  loading?: boolean;
  itemLabel?: string;
}

/**
 * AddItemForm is a controlled form for adding a new item to the EditableList.
 * It is accessible, responsive, and uses Aucctus theme classes.
 */
const AddItemForm: React.FC<AddItemFormProps> = ({
  value,
  onChange,
  onAdd,
  onCancel,
  loading = false,
  itemLabel = 'item',
}) => (
  <div className='space-y-2'>
    <Input
      name={`new-${itemLabel}`}
      className='!rounded-md p-1'
      placeholder={`Enter a new ${itemLabel}...`}
      value={value}
      onChange={onChange}
      onKeyDown={(e) => e.key === 'Enter' && onAdd()}
      disabled={loading}
      aria-label={`Add new ${itemLabel}`}
    />
    <div className='flex justify-end gap-2'>
      <Button
        size='sm'
        color='light'
        onClick={onCancel}
        className='text-xs'
        disabled={loading}
      >
        <span className='flex items-center'>
          <X size={14} className='aucctus-stroke-primary' />
        </span>
      </Button>
      <Button
        size='sm'
        color='primary'
        onClick={onAdd}
        className='text-xs'
        disabled={loading}
      >
        <span className='flex items-center'>
          <Check size={14} className='aucctus-stroke-white' />
          {loading && (
            <LoadingSpinner className='ml-2' height={16} width={16} />
          )}
        </span>
      </Button>
    </div>
  </div>
);

export default React.memo(AddItemForm);
