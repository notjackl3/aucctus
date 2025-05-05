import React from 'react';
import { Input, Button, Icon } from '@components';

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
        className='px-2 py-1 text-xs'
        disabled={loading}
      >
        <span className='flex items-center'>
          <Icon variant='closeX' height={14} width={14} className='mr-1' />
          Cancel
        </span>
      </Button>
      <Button
        size='sm'
        color='primary'
        onClick={onAdd}
        className='px-2 py-1 text-xs'
        disabled={loading}
      >
        <span className='flex items-center'>
          <Icon
            variant='check'
            height={14}
            width={14}
            className='aucctus-stroke-white mr-1'
          />
          Add
          {loading && (
            <Icon.LoadingSpinner className='ml-2' height={16} width={16} />
          )}
        </span>
      </Button>
    </div>
  </div>
);

export default React.memo(AddItemForm);
