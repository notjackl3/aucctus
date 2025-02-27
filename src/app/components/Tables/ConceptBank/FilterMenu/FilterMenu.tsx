import { Avatar, Icon, Input } from '@components';
import { useAllUsers } from '@hooks/query/account.hook';
import { IConceptFilterOptions } from '@hooks/tables/concept-bank.hook';
import { ConceptStatus } from '@libs/api/types';
import utils from '@libs/utils';
import { CONCEPT_STATUS_LIST } from '@libs/utils/concepts';
import * as Menubar from '@radix-ui/react-menubar';
import { cn } from '@libs/utils/react';
import React from 'react';
import SubMenuTrigger from './FilterMenuTrigger';

interface IFilterMenubarProps {
  filterOptions: IConceptFilterOptions;
  updateFilterOptions: (value: Partial<IConceptFilterOptions>) => void;
}

const FilterMenubar: React.FC<IFilterMenubarProps> = ({
  filterOptions,
  updateFilterOptions,
}) => {
  const [search, setSearch] = React.useState<string>('');
  const { users } = useAllUsers({ search });

  const menuItemClass =
    'group hover:outline-none transition-colors duration-300 aucctus-bg-primary-hover rounded-md focus-visible:outline-none focus:outline-none';
  const userMenuItemClassName = `flex flex-row h-16 items-center py-2 px-3 gap-2 aucctus-bg-primary`;
  const spanClassName =
    'truncate aucctus-text-md-medium aucctus-text-tertiary group-hover:text-primary-700';

  const createStatusCheckItem = React.useCallback(
    (value: ConceptStatus) => (
      <Menubar.Item
        key={utils.string.generateRandomString(5)}
        className={cn(menuItemClass, 'inline-flex items-center')}
        disabled
      >
        <Input.CheckBox
          id={`filter-status-${value}`}
          checked={filterOptions.status.has(value)}
          onChange={(e) => {
            const checked = e.target.checked;
            const statusSet = new Set(filterOptions.status);

            if (checked) {
              statusSet.add(value);
            } else {
              statusSet.delete(value);
            }
            updateFilterOptions({ status: statusSet });
          }}
        />
        <label
          className={
            'aucctus-text-md-medium aucctus-text-tertiary group-hover:text-primary-700'
          }
          htmlFor={`filter-status-${value}`}
        >
          {utils.string.camelCaseToTitleCase(value)}
        </label>
      </Menubar.Item>
    ),
    [filterOptions.status, updateFilterOptions],
  );

  return (
    <Menubar.Root className='flex flex-row'>
      <Menubar.Menu>
        <Menubar.Trigger className='aspect-square rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-primary-50 active:bg-primary-100 [&>svg]:stroke-primary-500'>
          <Icon variant='filter-lines' height={24} width={24} />
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className='aucctus-bg-primary flex w-auto flex-col gap-1 rounded-md p-2 shadow-lg will-change-[transform,opacity] [animation-duration:_400ms] [animation-timing-function:_cubic-bezier(0.16,_1,_0.3,_1)]'
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
                  {CONCEPT_STATUS_LIST.map((value) =>
                    createStatusCheckItem(value),
                  )}
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
                              let value: Partial<IConceptFilterOptions> = {
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
