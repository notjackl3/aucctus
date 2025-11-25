import { Avatar, Icon, Input } from '@components';
import { useAllUsers } from '@hooks/query/account.hook';
import { IConceptFilterOptions } from '@hooks/tables/concept-bank.hook';
import { IUser } from '@libs/api/types';
import utils from '@libs/utils';
import React, { useState } from 'react';

export interface ILastModifiedByFilterSubmenuProps {
  filterOptions: IConceptFilterOptions;
  updateFilterOptions: (value: Partial<IConceptFilterOptions>) => void;
  onClose?: () => void;
}

/**
 * Last Modified By filter submenu component
 * Used as a flyout submenu in StaticColumnMenu
 */
const LastModifiedByFilterSubmenu: React.FC<
  ILastModifiedByFilterSubmenuProps
> = ({ filterOptions, updateFilterOptions, onClose }) => {
  const [search, setSearch] = useState<string>('');
  const { users } = useAllUsers({ search });

  // Local state to buffer changes
  const [localSelection, setLocalSelection] = useState<Set<IUser> | undefined>(
    () => {
      if (!filterOptions.lastModifiedBy) return undefined;
      return filterOptions.lastModifiedBy instanceof Set
        ? filterOptions.lastModifiedBy
        : new Set(
            Array.isArray(filterOptions.lastModifiedBy)
              ? filterOptions.lastModifiedBy
              : [],
          );
    },
  );

  // Sync local state when filter options change
  React.useEffect(() => {
    if (!filterOptions.lastModifiedBy) {
      setLocalSelection(undefined);
    } else if (filterOptions.lastModifiedBy instanceof Set) {
      setLocalSelection(filterOptions.lastModifiedBy);
    } else {
      setLocalSelection(
        new Set(
          Array.isArray(filterOptions.lastModifiedBy)
            ? filterOptions.lastModifiedBy
            : [],
        ),
      );
    }
  }, [filterOptions.lastModifiedBy]);

  // Apply changes when submenu is left
  const handleApply = () => {
    if (localSelection !== filterOptions.lastModifiedBy) {
      updateFilterOptions({ lastModifiedBy: localSelection });
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
    updateFilterOptions({ lastModifiedBy: undefined });
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

        {/* User list with checkboxes */}
        <div className='max-h-80 min-h-[240px] overflow-y-auto'>
          {users.length > 0 ? (
            users.map((user) => {
              const isSelected = isUserSelected(user);

              return (
                <div
                  key={`user-${user.uuid}`}
                  className='aucctus-bg-primary-hover flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUserToggle(user);
                  }}
                >
                  <Input.CheckBox
                    key={`checkbox-${user.uuid}-${isSelected}`}
                    id={`filter-lastModifiedBy-${user.uuid}`}
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                    }}
                  />
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
              <Icon
                variant='closeX'
                className='aucctus-stroke-secondary h-4 w-4'
              />
              <span className='aucctus-text-secondary'>Clear filter</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LastModifiedByFilterSubmenu;
