import { Input, toast } from '@components';
import { IPropertyDefinition } from '@libs/api/types';
import React from 'react';
import api from '@libs/api';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '@hooks/query/query-keys';

interface ICheckboxPropertyCellProps {
  displayValue: any;
  definition: IPropertyDefinition;
  conceptIdentifier: string;
  isUpdating: boolean;
  onUpdateStart: () => void;
  onUpdateEnd: () => void;
  onDisplayValueChange: (value: any) => void;
}

/**
 * Checkbox property cell component
 * Handles inline checkbox editing with optimistic updates
 */
export const CheckboxPropertyCell: React.FC<ICheckboxPropertyCellProps> = ({
  displayValue,
  definition,
  conceptIdentifier,
  isUpdating,
  onUpdateStart,
  onUpdateEnd,
  onDisplayValueChange,
}) => {
  const queryClient = useQueryClient();

  // Use default value if displayValue is null/undefined
  const isChecked =
    displayValue === true ||
    (displayValue === null && definition.defaultValue === true);

  const handleCheckboxChange = async () => {
    if (isUpdating) return;

    const newValue = !isChecked;
    const previousValue = displayValue;

    // Optimistically update
    onDisplayValueChange(newValue);
    onUpdateStart();

    try {
      await api.property.setConceptProperty(
        conceptIdentifier,
        definition.key,
        newValue,
      );
      onUpdateEnd();

      // Invalidate concepts query to refresh table data
      queryClient.invalidateQueries([AucctusQueryKeys.concepts]);
    } catch (error: any) {
      // Revert on error
      onDisplayValueChange(previousValue);
      onUpdateEnd();

      toast.error(
        'Update Failed',
        error?.response?.data?.message || `Failed to update ${definition.name}`,
      );
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className='relative flex items-center justify-center'
    >
      <Input.CheckBox
        id={`property-${definition.key}-${conceptIdentifier}`}
        checked={isChecked}
        onChange={handleCheckboxChange}
        disabled={isUpdating}
      />
      {isUpdating && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='absolute inset-0 rounded bg-white/30 dark:bg-black/20' />
          <div className='relative h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500' />
        </div>
      )}
    </div>
  );
};
