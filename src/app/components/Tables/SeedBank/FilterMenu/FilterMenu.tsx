import { Avatar, Input } from '@components';
import { useAllUsers } from '@hooks/query/account.hook';
import { ISeedFilterOptions } from '@hooks/tables/concept-seed.hook';
import { SeedStatus } from '@libs/api/types';
import utils from '@libs/utils';
import { SEED_STATUS_LIST } from '@libs/utils/concepts';
import { cn } from '@libs/utils/react';
import * as Menubar from '@radix-ui/react-menubar';
import React from 'react';
import SubMenuTrigger from './FilterMenuTrigger';
import { ListFilter } from 'lucide-react';

// TODO: Revisit typing for status options

interface IFilterMenubarProps {
  filterOptions: ISeedFilterOptions;
  updateFilterOptions: (value: Partial<ISeedFilterOptions>) => void;
  statusOptions?: Array<{ value: string; label: string }>;
}

const FilterMenubar: React.FC<IFilterMenubarProps> = ({
  filterOptions,
  updateFilterOptions,
  statusOptions,
}) => {
  const [search, setSearch] = React.useState<string>('');
  const { users } = useAllUsers({ search });

  const menuItemClass =
    'group hover:outline-none transition-colors duration-300 aucctus-bg-primary-hover rounded-md focus-visible:outline-none focus:outline-none';
  const userMenuItemClassName = `flex flex-row h-16 items-center py-2 px-3 gap-2 aucctus-bg-primary`;
  const spanClassName =
    'truncate aucctus-text-md-medium aucctus-text-tertiary group-hover:text-primary-700';

  const createStatusCheckItem = React.useCallback(
    (value: SeedStatus) => (
      <Menubar.Item
        key={utils.string.generateRandomString(5)}
        className={cn(menuItemClass, 'inline-flex items-center')}
        disabled
      >
        <Input.CheckBox
          id={`filter-status-${value}`}
          // @ts-ignore
          checked={filterOptions.status.has(value)}
          onChange={(e) => {
            const checked = e.target.checked;
            const statusSet = new Set(filterOptions.status);

            if (checked) {
              statusSet.add(value);
            } else {
              statusSet.delete(value);
            }
            // @ts-ignore
            updateFilterOptions({ status: statusSet });
          }}
        />
        <label
          htmlFor={`filter-status-${value}`}
          className='aucctus-text-secondary ml-2 block cursor-pointer text-sm font-medium'
        >
          {utils.string.camelCaseToTitleCase(value)}
        </label>
      </Menubar.Item>
    ),
    [filterOptions.status, updateFilterOptions],
  );

  const createCustomStatusCheckItem = React.useCallback(
    (option: { value: string; label: string }) => (
      <Menubar.Item
        key={utils.string.generateRandomString(5)}
        className={cn(menuItemClass, 'inline-flex items-center')}
        disabled
      >
        <Input.CheckBox
          id={`filter-status-${option.value}`}
          // @ts-ignore
          checked={filterOptions.status.has(option.value)}
          onChange={(e) => {
            const checked = e.target.checked;
            const statusSet = new Set(filterOptions.status);

            if (checked) {
              // @ts-ignore
              statusSet.add(option.value);
            } else {
              // @ts-ignore
              statusSet.delete(option.value);
            }
            // @ts-ignore
            updateFilterOptions({ status: statusSet });
          }}
        />
        <label
          htmlFor={`filter-status-${option.value}`}
          className='aucctus-text-secondary ml-2 block cursor-pointer text-sm font-medium'
        >
          {option.label}
        </label>
      </Menubar.Item>
    ),
    [filterOptions.status, updateFilterOptions],
  );

  return (
    <Menubar.Root className='flex flex-row'>
      <Menubar.Menu>
        <Menubar.Trigger className='flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors duration-200 hover:bg-primary-50 active:bg-primary-100'>
          <ListFilter className='stroke-primary-500' />
          <span className='font-inter text-sm font-semibold leading-[143%] text-[#514141]'>
            Filters
          </span>
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className='aucctus-bg-primary z-[9999] flex w-auto flex-col gap-1 rounded-md p-2 shadow-lg will-change-[transform,opacity] [animation-duration:_400ms] [animation-timing-function:_cubic-bezier(0.16,_1,_0.3,_1)]'
            align='end'
            side='bottom'
          >
            <Menubar.Sub>
              <SubMenuTrigger label='Status' icon='loading-02' />
              <Menubar.Portal>
                <Menubar.SubContent
                  className='aucctus-bg-primary flex w-auto flex-col gap-1 rounded-md p-3 shadow-lg will-change-[transform,opacity] [animation-duration:_400ms] [animation-timing-function:_cubic-bezier(0.16,_1,_0.3,_1)]'
                  alignOffset={-5}
                >
                  <div className='box-border flex w-full flex-col px-2'>
                    {statusOptions
                      ? statusOptions.map((option) =>
                          createCustomStatusCheckItem(option),
                        )
                      : SEED_STATUS_LIST.map((status) =>
                          createStatusCheckItem(status),
                        )}
                  </div>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>

            <Menubar.Sub>
              <SubMenuTrigger label='Created By' icon='user-group' />
              <Menubar.Portal>
                <Menubar.SubContent
                  sticky='always'
                  className='aucctus-bg-primary flex w-auto flex-col gap-1 rounded-md p-3 shadow-lg will-change-[transform,opacity] [animation-duration:_400ms] [animation-timing-function:_cubic-bezier(0.16,_1,_0.3,_1)]'
                  alignOffset={-5}
                >
                  <div className='className="max-w-[100px]'>
                    <Input.Search
                      value={search}
                      debounce={500}
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                    />
                  </div>
                  <div className='max-h-80 min-h-[240px] overflow-y-auto rounded-lg'>
                    {users.length > 0 ? (
                      users.map((user) => {
                        const filterCreatedByIsUser =
                          user.uuid === filterOptions.createdBy?.uuid;

                        return (
                          <Menubar.Item
                            className={cn(
                              menuItemClass,
                              userMenuItemClassName,
                              'hover:shadow-md',
                              'aucctus-border-tertiary border',
                              {
                                'bg-primary-100': filterCreatedByIsUser,
                              },
                            )}
                            key={`uf-${user.uuid}`}
                            disabled
                            onClick={() => {
                              let value: Partial<ISeedFilterOptions> = {
                                createdBy: undefined,
                              };
                              if (!filterCreatedByIsUser) {
                                value.createdBy = user;
                              }
                              updateFilterOptions(value);
                            }}
                          >
                            <Avatar
                              firstName={user.firstName}
                              lastName={user.lastName}
                              src={user.profileImage}
                            />
                            <span
                              className={cn(spanClassName, {
                                'text-primary-700': filterCreatedByIsUser,
                              })}
                            >
                              {utils.account.getUsersFullName(user)}
                            </span>
                          </Menubar.Item>
                        );
                      })
                    ) : (
                      <Menubar.Item
                        className={cn(menuItemClass, userMenuItemClassName)}
                        disabled
                      >
                        <span className={spanClassName}>No Users Found</span>
                      </Menubar.Item>
                    )}
                  </div>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
};

export default FilterMenubar;
