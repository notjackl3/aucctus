import { Avatar, Input } from '@components';
import { useAllUsers } from '@hooks/query/account.hook';
import { IConceptFilterOptions } from '@hooks/tables/concept-bank.hook';
import { IUser } from '@libs/api/types';
import utils from '@libs/utils';
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

export interface ICreatedByFilterSubmenuProps {
  filterOptions: IConceptFilterOptions;
  updateFilterOptions: (value: Partial<IConceptFilterOptions>) => void;
  onClose?: () => void;
}

/**
 * Created By filter submenu component
 * Used as a flyout submenu in StaticColumnMenu
 */
const CreatedByFilterSubmenu: React.FC<ICreatedByFilterSubmenuProps> = ({
  filterOptions,
  updateFilterOptions,
  onClose,
}) => {
  const [search, setSearch] = useState<string>('');
  const { users } = useAllUsers({ search });

  // Local state to buffer changes
  const [localSelection, setLocalSelection] = useState<Set<IUser> | undefined>(
    () => {
      if (!filterOptions.createdBy) return undefined;
      return filterOptions.createdBy instanceof Set
        ? filterOptions.createdBy
        : new Set(
            Array.isArray(filterOptions.createdBy)
              ? filterOptions.createdBy
              : [],
          );
    },
  );

  // Sync local state when filter options change
  React.useEffect(() => {
    if (!filterOptions.createdBy) {
      setLocalSelection(undefined);
    } else if (filterOptions.createdBy instanceof Set) {
      setLocalSelection(filterOptions.createdBy);
    } else {
      setLocalSelection(
        new Set(
          Array.isArray(filterOptions.createdBy) ? filterOptions.createdBy : [],
        ),
      );
    }
  }, [filterOptions.createdBy]);

  // Apply changes when submenu is left
  const handleApply = () => {
    if (localSelection !== filterOptions.createdBy) {
      updateFilterOptions({ createdBy: localSelection });
    }
    if (onClose) {
      onClose();
    }
  };

  const hasActiveFilter = localSelection && localSelection.size > 0;

  const handleUserToggle = (user: IUser) => {
    setLocalSelection((prevSelection) => {
      const currentSet = prevSelection
        ? new Set(prevSelection)
        : new Set<IUser>();

      const isSelected = Array.from(currentSet).some(
        (u) => u.uuid === user.uuid,
      );

      if (isSelected) {
        const newSet = new Set(
          Array.from(currentSet).filter((u) => u.uuid !== user.uuid),
        );
        return newSet.size > 0 ? newSet : undefined;
      } else {
        const newSet = new Set([...Array.from(currentSet), user]);
        return newSet;
      }
    });
  };

  const handleClearFilter = () => {
    setLocalSelection(undefined);
    updateFilterOptions({ createdBy: undefined });
    if (onClose) {
      onClose();
    }
  };

  const isUserSelected = (user: IUser): boolean => {
    if (!localSelection) return false;
    return Array.from(localSelection).some((u) => u.uuid === user.uuid);
  };

  return (
    <div
      className='aucctus-bg-primary aucctus-border-secondary w-[280px] rounded-lg border shadow-lg'
      onMouseLeave={handleApply}
    >
      <div className='p-3'>
        {/* Search input */}
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

        {/* User list */}
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
                    handleUserToggle(user);
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

        {/* Clear filter button */}
        {hasActiveFilter && (
          <>
            <div className='aucctus-bg-secondary my-2 h-px' />
            <button
              className='aucctus-bg-primary-hover flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none transition-colors'
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                handleClearFilter();
              }}
            >
              <X className='aucctus-stroke-secondary h-4 w-4' />
              <span className='aucctus-text-secondary'>Clear filter</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreatedByFilterSubmenu;
