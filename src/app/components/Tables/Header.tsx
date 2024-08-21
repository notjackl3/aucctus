import { Icon, Input } from '@components';
import { Column, Header, flexRender } from '@tanstack/react-table';
import classNames from 'classnames';
import React from 'react';

// Props for the TableHeader component
interface ITableHeaderProps<T> {
  header: Header<T, unknown>;
}

// TableHeader Component
const TableHeader: React.FC<ITableHeaderProps<any>> = <T,>({ header }: ITableHeaderProps<T>) => {
  return (
    <th
      className='text-nowrap p-3 align-top text-base font-medium leading-normal text-indigo-900 first:pl-6 last:pr-6'
      key={header.id}
    >
      {header.isPlaceholder ? null : (
        <span className='flex flex-row items-center justify-start [&>svg]:stroke-indigo-900'>
          <span
            className={classNames([
              'flex items-center justify-start',
              {
                'cursor-pointer': header.column.getCanSort(),
                'select-none': header.column.getCanSort(),
              },
            ])}
            onClick={header.column.getToggleSortingHandler()}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {{
              asc: <Icon variant='arrowup' className='ml-1 stroke-indigo-900' />,
              desc: <Icon variant='arrowdown' className='ml-1 stroke-indigo-900' />,
            }[header.column.getIsSorted() as string] ?? null}
          </span>
          {header.column.getCanFilter() ? (
            <span className='mt-2'>
              <Filter column={header.column} />
            </span>
          ) : null}
        </span>
      )}
    </th>
  );
};

// Filter Component (unchanged)
function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <Input
      type='text'
      value={(columnFilterValue ?? '') as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      className='w-36 rounded border shadow'
    />
  );
}

export default TableHeader;
