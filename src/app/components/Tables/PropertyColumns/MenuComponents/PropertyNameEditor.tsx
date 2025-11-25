import { Icon } from '@components';
import { IconVariant } from '@components/Icon/Icon/icons';
import { IPropertyDefinition } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React from 'react';
import { IconPickerDropdown } from '@components/Dropdown';
import { getPropertyIcon } from '@libs/utils/propertyIcons';

interface IPropertyNameEditorProps {
  definition: IPropertyDefinition;
  propertyName: string;
  isEditingName: boolean;
  isUpdatingName: boolean;
  onPropertyNameChange: (name: string) => void;
  onStartEditing: () => void;
  onSaveName: () => void;
  onCancelEdit: () => void;
  onIconSelect: (icon: string) => void;
}

/**
 * Property name editor section with icon picker
 * Allows inline editing of property name and icon selection
 */
export const PropertyNameEditor: React.FC<IPropertyNameEditorProps> = ({
  definition,
  propertyName,
  isEditingName,
  isUpdatingName,
  onPropertyNameChange,
  onStartEditing,
  onSaveName,
  onCancelEdit,
  onIconSelect,
}) => {
  return (
    <div className='aucctus-border-secondary border-b p-3'>
      <div className='flex items-center gap-2'>
        <IconPickerDropdown
          currentIcon={getPropertyIcon(definition)}
          onSelect={onIconSelect}
          trigger={
            <button
              type='button'
              className='aucctus-bg-secondary-hover hover:aucctus-bg-tertiary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded transition-colors'
            >
              <Icon
                variant={getPropertyIcon(definition) as IconVariant}
                className='aucctus-stroke-secondary h-4 w-4'
              />
            </button>
          }
        />
        {isEditingName ? (
          <input
            type='text'
            value={propertyName}
            onChange={(e) => onPropertyNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSaveName();
              } else if (e.key === 'Escape') {
                onCancelEdit();
              }
            }}
            onBlur={onSaveName}
            className='aucctus-bg-primary aucctus-border-brand aucctus-text-primary flex-1 rounded border px-2 py-1.5 text-sm font-medium focus:outline-none'
            autoFocus
          />
        ) : (
          <button
            onClick={() => !isUpdatingName && onStartEditing()}
            disabled={isUpdatingName}
            className={cn(
              'aucctus-bg-primary-hover aucctus-text-primary flex-1 rounded px-2 py-1.5 text-left text-sm font-medium transition-colors',
              isUpdatingName ? 'cursor-wait opacity-60' : 'cursor-text',
            )}
          >
            <div className='flex items-center gap-2'>
              {isUpdatingName && (
                <Icon
                  variant='loading-02'
                  className='aucctus-stroke-tertiary h-3 w-3 animate-spin'
                />
              )}
              <span>{propertyName}</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
