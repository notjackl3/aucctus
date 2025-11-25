import { toast } from '@components';
import { IPropertyDefinition } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React, { useState, useRef, useEffect } from 'react';
import api from '@libs/api';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import {
  getOptionColor,
  getColoredTagStyles,
  extractOptionValues,
} from '@libs/utils/propertyColors';
import { usePropertyCellState, useDropdownPosition } from './hooks';
import {
  CheckboxPropertyCell,
  TextPropertyCell,
  NumberPropertyCell,
  SelectPropertyCell,
  MultiSelectPropertyCell,
} from './PropertyCells';

interface IEditablePropertyCellProps {
  value: any;
  definition: IPropertyDefinition;
  conceptIdentifier: string;
  isEvenRow?: boolean;
  shouldWrap?: boolean;
}

/**
 * Editable property cell with inline editing (Notion-style)
 * Supports: text, number, select, checkbox
 */
const EditablePropertyCell: React.FC<IEditablePropertyCellProps> = ({
  value,
  definition,
  conceptIdentifier,
  isEvenRow = false,
  shouldWrap = false,
}) => {
  const queryClient = useQueryClient();
  const {
    isEditing,
    setIsEditing,
    editValue,
    setEditValue,
    isUpdating,
    setIsUpdating,
    displayValue,
    setDisplayValue,
  } = usePropertyCellState(value);

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const cellRef = useRef<HTMLButtonElement>(null);

  // Normalize property_type field (handle both snake_case and camelCase)
  const propertyType =
    definition.propertyType || (definition as any).propertyType;

  // Get dropdown position
  const dropdownPosition = useDropdownPosition(
    isSelectOpen,
    selectRef,
    cellRef,
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isSelectOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isPortalTarget =
        (event.target as Element)?.closest(
          '[data-aucctus-portal-target="true"]',
        ) ||
        (event.target as Element)?.hasAttribute('data-aucctus-portal-target');

      if (!isPortalTarget) {
        setIsSelectOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelectOpen, setIsEditing]);

  // Save multi-select changes when dropdown closes
  useEffect(() => {
    // Only run when closing multi-select dropdown (was open, now closed)
    if (propertyType !== 'multi_select' || isSelectOpen || isEditing) return;

    const handleMultiSelectSave = async () => {
      // Don't update if value hasn't changed
      const currentValues = Array.isArray(editValue) ? editValue : [];
      const displayValues = Array.isArray(displayValue) ? displayValue : [];

      if (
        currentValues.length === displayValues.length &&
        currentValues.every((v: string) => displayValues.includes(v))
      ) {
        return;
      }

      const previousValue = displayValue;
      setDisplayValue(currentValues);
      setIsUpdating(true);

      try {
        await api.property.setConceptProperty(
          conceptIdentifier,
          definition.key,
          currentValues,
        );
        setIsUpdating(false);

        // Invalidate concepts query to refresh table data
        queryClient.invalidateQueries([AucctusQueryKeys.concepts]);
      } catch (error: any) {
        // Revert on error
        setDisplayValue(previousValue);
        setEditValue(previousValue);
        setIsUpdating(false);

        toast.error(
          'Update Failed',
          error?.response?.data?.message ||
            `Failed to update ${definition.name}`,
        );
      }
    };

    handleMultiSelectSave();
  }, [
    isSelectOpen,
    isEditing,
    propertyType,
    editValue,
    displayValue,
    conceptIdentifier,
    definition.key,
    definition.name,
    queryClient,
    setDisplayValue,
    setEditValue,
    setIsUpdating,
  ]);

  const handleSave = async () => {
    // Don't save if value hasn't changed or already updating
    if (editValue === displayValue || isUpdating) {
      setIsEditing(false);
      return;
    }

    // Optimistically update the display value
    const previousValue = displayValue;
    setDisplayValue(editValue);
    setIsEditing(false);
    setIsUpdating(true);

    try {
      // Make the API call
      await api.property.setConceptProperty(
        conceptIdentifier,
        definition.key,
        editValue,
      );

      // Success - keep the new value and invalidate concepts query
      setIsUpdating(false);

      // Invalidate concepts query to refresh table data
      queryClient.invalidateQueries([AucctusQueryKeys.concepts]);
    } catch (error: any) {
      // Error - revert to previous value
      setDisplayValue(previousValue);
      setEditValue(previousValue);
      setIsUpdating(false);

      toast.error(
        'Update Failed',
        error?.response?.data?.message || `Failed to update ${definition.name}`,
      );
    }
  };

  const handleCancel = () => {
    setEditValue(displayValue);
    setIsEditing(false);
  };

  // Checkbox is always "editable" - just click to toggle
  if (propertyType === 'checkbox') {
    return (
      <CheckboxPropertyCell
        displayValue={displayValue}
        definition={definition}
        conceptIdentifier={conceptIdentifier}
        isUpdating={isUpdating}
        onUpdateStart={() => setIsUpdating(true)}
        onUpdateEnd={() => setIsUpdating(false)}
        onDisplayValueChange={setDisplayValue}
      />
    );
  }

  // Display mode
  if (!isEditing) {
    // Determine display value and placeholder based on type
    const isEmpty =
      displayValue === null ||
      displayValue === undefined ||
      displayValue === '';

    let displayContent;
    if (propertyType === 'select') {
      displayContent = isEmpty ? (
        <span className='aucctus-text-quaternary opacity-0 transition-opacity group-hover:opacity-100'>
          Select...
        </span>
      ) : (
        <span
          className='inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium'
          style={getColoredTagStyles(
            getOptionColor(String(displayValue), definition),
          )}
        >
          {String(displayValue)}
        </span>
      );
    } else if (propertyType === 'multi_select') {
      const values = Array.isArray(displayValue) ? displayValue : [];
      displayContent =
        values.length === 0 ? (
          <span className='aucctus-text-quaternary opacity-0 transition-opacity group-hover:opacity-100'>
            Select options...
          </span>
        ) : (
          <div className={cn('flex gap-1', { 'flex-wrap': shouldWrap })}>
            {values.map((val: string, idx: number) => (
              <span
                key={idx}
                className='line-clamp-1 inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium'
                style={getColoredTagStyles(
                  getOptionColor(String(val), definition),
                )}
              >
                {String(val)}
              </span>
            ))}
          </div>
        );
    } else if (propertyType === 'number') {
      displayContent = isEmpty ? (
        <span className='aucctus-text-quaternary opacity-0 transition-opacity group-hover:opacity-100'>
          Enter number...
        </span>
      ) : (
        <span>{(displayValue as number).toLocaleString()}</span>
      );
    } else if (propertyType === 'text') {
      displayContent = isEmpty ? (
        <span className='aucctus-text-quaternary opacity-0 transition-opacity group-hover:opacity-100'>
          Click to add...
        </span>
      ) : (
        <span>{String(displayValue)}</span>
      );
    } else {
      displayContent = <span>{isEmpty ? '—' : String(displayValue)}</span>;
    }

    return (
      <div className='relative'>
        <button
          ref={cellRef}
          onClick={(e) => {
            if (isUpdating) return;
            e.stopPropagation();
            setIsEditing(true);
            if (propertyType === 'select' || propertyType === 'multi_select') {
              // Ensure multi_select values are arrays
              if (
                propertyType === 'multi_select' &&
                !Array.isArray(editValue)
              ) {
                setEditValue(
                  displayValue && Array.isArray(displayValue)
                    ? displayValue
                    : [],
                );
              }
              setIsSelectOpen(true);
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={isUpdating}
          className={cn(
            'aucctus-text-primary group flex w-full items-center rounded px-4 py-1 text-left text-sm transition-colors',
            {
              'cursor-pointer':
                propertyType === 'select' || propertyType === 'multi_select',
              'cursor-text':
                propertyType === 'text' || propertyType === 'number',
              'aucctus-bg-secondary-hover': isEvenRow && !isUpdating,
              'aucctus-bg-primary-hover': !isEvenRow && !isUpdating,
              'cursor-not-allowed opacity-50': isUpdating,
              'whitespace-nowrap': !shouldWrap,
            },
          )}
        >
          {displayContent}
        </button>

        {/* Loading overlay */}
        {isUpdating && (
          <div className='absolute inset-0 flex items-center justify-center rounded'>
            <div className='absolute inset-0 rounded bg-white/30 dark:bg-black/20' />
            <div className='relative h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500' />
          </div>
        )}
      </div>
    );
  }

  // Edit mode - guard to prevent errors
  // Validate property type
  const validTypes = ['text', 'number', 'select', 'multi_select', 'checkbox'];
  if (!propertyType || !validTypes.includes(propertyType)) {
    // eslint-disable-next-line no-console
    console.error(
      'Invalid property type:',
      propertyType,
      'Definition:',
      definition,
    );
    return (
      <div className='aucctus-text-error-primary p-2 text-sm'>
        Error: Invalid property type &quot;{propertyType || 'undefined'}&quot;
      </div>
    );
  }

  return (
    <div
      ref={selectRef}
      className='flex w-full items-center gap-1'
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {propertyType === 'text' && (
        <TextPropertyCell
          editValue={editValue}
          definition={definition}
          onEditValueChange={setEditValue}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {propertyType === 'number' && (
        <NumberPropertyCell
          editValue={editValue}
          definition={definition}
          onEditValueChange={setEditValue}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {propertyType === 'select' && (
        <SelectPropertyCell
          editValue={editValue}
          definition={definition}
          options={extractOptionValues(definition.config.options)}
          dropdownPosition={dropdownPosition}
          isSelectOpen={isSelectOpen}
          onSelect={async (option) => {
            setEditValue(option);
            setIsSelectOpen(false);
            setIsEditing(false);

            // Don't update if value hasn't changed
            if (option === displayValue) return;

            const previousValue = displayValue;
            setDisplayValue(option);
            setIsUpdating(true);

            try {
              await api.property.setConceptProperty(
                conceptIdentifier,
                definition.key,
                option,
              );
              setIsUpdating(false);

              // Invalidate concepts query to refresh table data
              queryClient.invalidateQueries([AucctusQueryKeys.concepts]);
            } catch (error: any) {
              // Revert on error
              setDisplayValue(previousValue);
              setEditValue(previousValue);
              setIsUpdating(false);

              toast.error(
                'Update Failed',
                error?.response?.data?.message ||
                  `Failed to update ${definition.name}`,
              );
            }
          }}
        />
      )}

      {propertyType === 'multi_select' && (
        <MultiSelectPropertyCell
          editValue={editValue}
          definition={definition}
          options={extractOptionValues(definition.config.options)}
          dropdownPosition={dropdownPosition}
          isSelectOpen={isSelectOpen}
          onToggle={(option) => {
            setEditValue((prev: any) => {
              const currentValues = Array.isArray(prev) ? prev : [];
              if (currentValues.includes(option)) {
                return currentValues.filter((v: string) => v !== option);
              } else {
                return [...currentValues, option];
              }
            });
          }}
        />
      )}

      {/* Fallback for unexpected property types that passed validation */}
      {!['text', 'number', 'select', 'multi_select', 'checkbox'].includes(
        propertyType,
      ) && (
        <div className='aucctus-text-error-primary p-2 text-sm'>
          Unsupported type: {propertyType}
        </div>
      )}
    </div>
  );
};

export default EditablePropertyCell;
