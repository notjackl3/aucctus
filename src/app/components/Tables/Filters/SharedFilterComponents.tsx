import { Avatar, Input } from '@components';
import { useAllUsers } from '@hooks/query/account.hook';
import {
  ConceptStatus,
  IPropertyDefinition,
  IPropertyFilter,
  IUser,
} from '@libs/api/types';
import utils from '@libs/utils';
import { CONCEPT_STATUS_LIST } from '@libs/utils/concepts';
import React, { useState } from 'react';
import {
  TextFilterInput,
  NumberFilterInput,
  SelectFilterInput,
  CheckboxFilterInput,
} from '../PropertyColumns/FilterInputs';
import { Check } from 'lucide-react';

// ============================================================================
// Status Filter Content
// ============================================================================

interface IStatusFilterContentProps {
  localSelection: Set<ConceptStatus>;
  onToggle: (status: ConceptStatus) => void;
}

export const StatusFilterContent: React.FC<IStatusFilterContentProps> = ({
  localSelection,
  onToggle,
}) => {
  return (
    <div className='max-h-80 overflow-y-auto'>
      {CONCEPT_STATUS_LIST.map((status) => {
        const isSelected = localSelection.has(status);
        return (
          <div
            key={status}
            className='aucctus-text-sm aucctus-text-primary aucctus-bg-primary-hover flex cursor-pointer items-center justify-between gap-2 rounded px-3 py-2 transition-colors'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(status);
            }}
          >
            <span className='aucctus-text-secondary text-sm font-medium'>
              {utils.string.camelCaseToTitleCase(status)}
            </span>
            {isSelected && (
              <Check className='aucctus-stroke-success-primary h-4 w-4 flex-shrink-0' />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// User Filter Content
// ============================================================================

interface IUserFilterContentProps {
  localSelection: Set<IUser> | undefined;
  onToggle: (user: IUser) => void;
  /** @deprecated No longer used, kept for backwards compatibility */
  filterType?: 'createdBy' | 'lastModifiedBy';
}

export const UserFilterContent: React.FC<IUserFilterContentProps> = ({
  localSelection,
  onToggle,
}) => {
  const [search, setSearch] = useState<string>('');
  const { users } = useAllUsers({ search });

  const isUserSelected = (user: IUser): boolean => {
    if (!localSelection) return false;
    return Array.from(localSelection).some((u) => u.uuid === user.uuid);
  };

  return (
    <>
      <div className='mb-2'>
        <Input.Search
          value={search}
          debounce={500}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          placeholder='Search users...'
        />
      </div>

      <div className='max-h-80 min-h-[240px] overflow-y-auto'>
        {users.length > 0 ? (
          users.map((user) => {
            const isSelected = isUserSelected(user);
            return (
              <div
                key={`user-${user.uuid}`}
                className='aucctus-bg-primary-hover flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 transition-colors'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle(user);
                }}
              >
                <div className='flex flex-1 items-center gap-2'>
                  <Avatar
                    firstName={user.firstName}
                    lastName={user.lastName}
                    src={user.profileImage}
                  />
                  <span className='aucctus-text-secondary truncate text-sm font-medium'>
                    {utils.account.getUsersFullName(user)}
                  </span>
                </div>
                {isSelected && (
                  <Check className='aucctus-stroke-success-primary h-4 w-4 flex-shrink-0' />
                )}
              </div>
            );
          })
        ) : (
          <div className='aucctus-text-quaternary flex h-full items-center justify-center text-sm'>
            No users found
          </div>
        )}
      </div>
    </>
  );
};

// ============================================================================
// Property Filter Content
// ============================================================================

interface IPropertyFilterContentProps {
  propDef: IPropertyDefinition;
  filterValue: any;
  filterOperator: IPropertyFilter['operator'];
  onFilterValueChange: (value: any) => void;
  onFilterOperatorChange: (operator: IPropertyFilter['operator']) => void;
  onApply: () => void;
  onCancel: () => void;
}

export const PropertyFilterContent: React.FC<IPropertyFilterContentProps> = ({
  propDef,
  filterValue,
  filterOperator,
  onFilterValueChange,
  onFilterOperatorChange,
  onApply,
  onCancel,
}) => {
  switch (propDef.propertyType) {
    case 'text':
      return (
        <TextFilterInput
          definition={propDef}
          filterValue={filterValue}
          filterOperator={filterOperator}
          onFilterValueChange={onFilterValueChange}
          onFilterOperatorChange={onFilterOperatorChange}
          onApply={onApply}
          onCancel={onCancel}
        />
      );

    case 'number':
      return (
        <NumberFilterInput
          definition={propDef}
          filterValue={filterValue}
          filterOperator={filterOperator}
          onFilterValueChange={onFilterValueChange}
          onFilterOperatorChange={onFilterOperatorChange}
          onApply={onApply}
          onCancel={onCancel}
        />
      );

    case 'select':
    case 'multi_select': {
      const selectedValues = Array.isArray(filterValue)
        ? filterValue
        : filterValue
          ? [filterValue]
          : [];

      const toggleOption = (option: string) => {
        const newValues = selectedValues.includes(option)
          ? selectedValues.filter((v) => v !== option)
          : [...selectedValues, option];
        onFilterValueChange(newValues);
      };

      const applySelectFilter = () => {
        // Ensure operator is set to 'in' for select/multi-select
        onFilterOperatorChange('in');
        onApply();
      };

      return (
        <SelectFilterInput
          definition={propDef}
          selectedValues={selectedValues}
          onToggle={toggleOption}
          onApply={applySelectFilter}
        />
      );
    }

    case 'checkbox': {
      const applyCheckboxFilter = (
        value: string,
        boolValue: boolean | null,
      ) => {
        onFilterValueChange(boolValue);
        onApply();
      };

      return (
        <CheckboxFilterInput
          definition={propDef}
          filterValue={
            typeof filterValue === 'boolean'
              ? String(filterValue)
              : String(filterValue)
          }
          onSelect={applyCheckboxFilter}
        />
      );
    }

    default:
      return null;
  }
};
