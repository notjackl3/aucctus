import { Icon, Input } from '@components';
import { ConceptStatus } from '@libs/api/types';
import { CONCEPT_STATUS_LIST } from '@libs/concepts';
import { camelCaseToTitleCase } from '@libs/utils';
import * as Menubar from '@radix-ui/react-menubar';
import React from 'react';

interface IFilterMenubarProps {
  onStatusSelect: (status: ConceptStatus, checked: boolean) => void;
}

const FilterMenubar: React.FC<IFilterMenubarProps> = ({ onStatusSelect }) => {
  const createStatusCheckItem = React.useCallback(
    (value: ConceptStatus) => (
      <Menubar.Item className='hover:outline-none' disabled>
        <Input.CheckBox
          id={`filter-status-${value}`}
          onChange={(e) => {
            onStatusSelect(value, e.target.checked);
          }}
        />
        <label className={'text-base font-medium leading-tight text-slate-500'} htmlFor={`filter-status-${value}`}>
          {camelCaseToTitleCase(value)}
        </label>
      </Menubar.Item>
    ),
    [onStatusSelect],
  );

  return (
    <Menubar.Root className='flex flex-row'>
      <Menubar.Menu>
        <Menubar.Trigger className='px-3 py-2 [&>svg]:stroke-primary-500'>
          <Icon variant='filter-lines' height={24} width={24} />
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className='flex min-w-[220px] flex-col gap-1 rounded-lg bg-white p-2 shadow-lg will-change-[transform,opacity] [animation-duration:_400ms] [animation-timing-function:_cubic-bezier(0.16,_1,_0.3,_1)]'
            align='start'
            sideOffset={5}
            alignOffset={-3}
          >
            {CONCEPT_STATUS_LIST.map((value, index) => createStatusCheckItem(value))}
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className='px-3 py-2 [&>svg]:stroke-primary-500'>
          <Icon variant='calendar' height={24} width={24} />
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className='min-w-[220px] rounded-md bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[transform,opacity] [animation-duration:_400ms] [animation-timing-function:_cubic-bezier(0.16,_1,_0.3,_1)]'
            align='start'
            sideOffset={5}
            alignOffset={-3}
          >
            ... Calender ...
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className='px-3 py-2 [&>svg]:stroke-primary-500'>
          <Icon variant='user-group' height={24} width={24} />
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className='min-w-[220px] rounded-md bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[transform,opacity] [animation-duration:_400ms] [animation-timing-function:_cubic-bezier(0.16,_1,_0.3,_1)]'
            align='start'
            sideOffset={5}
            alignOffset={-3}
          >
            ... List of Users ...
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
};

export default FilterMenubar;
