import { Button, Icon } from '@components';
import { ConceptStatus } from '@libs/api/types';
import { CONCEPT_STATUS_LIST, getConceptStatusStyles } from '@libs/concepts';
import { camelCaseToTitleCase, generateRandomString } from '@libs/utils';
import classNames from 'classnames';

import * as Popover from '@radix-ui/react-popover';
import React from 'react';

interface IFilterOptions {
  selectedStatus: ConceptStatus[];
  onStatusSelect: (value: ConceptStatus) => (checked: boolean) => void;
}

const FilterOptions: React.FC<IFilterOptions> = ({ onStatusSelect, selectedStatus }) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={classNames([
            'flex items-center justify-center',
            'h-9 w-9',
            'rounded-full shadow-md',
            'bg-white text-primary-500 [&>svg]:stroke-primary-500',

            'hover:border-2 hover:border-primary-500',
            'focus:border-2 focus:border-primary-500',
            'data-[state=open]:border-2 data-[state=open]:border-primary-500',
            // "focus:ring-primary-400 ",
            // "focus-visible:border-primary-400",
          ])}
          aria-label='Update dimensions'
        >
          <Icon variant='filter-lines' strokeWidth={16} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='rounded-lg bg-white p-5 shadow-lg focus:ring-2 focus:ring-primary-500'
          side='bottom'
        >
          <div className='flex flex-col gap-2.5'>
            <p className='mb-2.5 text-base font-medium leading-5 text-gray-400'>Status</p>

            {CONCEPT_STATUS_LIST.map((value) => (
              <Button.Checkbox
                labelClassNames={getConceptStatusStyles(value).text}
                label={camelCaseToTitleCase(value)}
                checked={selectedStatus.includes(value)}
                onCheckedChange={onStatusSelect(value)}
                id={`${generateRandomString(3)}${value}`}
              />
            ))}
          </div>

          <Popover.Close
            className='absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-primary-500 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
            aria-label='Close'
          >
            <Icon variant='closeX' />
          </Popover.Close>
          <Popover.Arrow className='fill-white' />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default FilterOptions;
