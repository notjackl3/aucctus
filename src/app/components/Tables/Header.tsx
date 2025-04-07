import { Icon, Input } from '@components';
import { cn } from '@libs/utils/react';
import { Column, Header, flexRender } from '@tanstack/react-table';
import React from 'react';

// Props for the TableHeader component
interface ITableHeaderProps<T>
  extends React.HTMLAttributes<HTMLTableHeaderCellElement> {
  header: Header<T, unknown>;
}

// TableHeader Component
const TableHeader: React.FC<ITableHeaderProps<any>> = <T,>({
  header,
  ...props
}: ITableHeaderProps<T>) => {
  return (
    <th
      {...props}
      className={cn(
        'aucctus-text-primary text-nowrap p-3 align-top text-base font-medium leading-normal first:pl-6 last:pr-6',
        props.className,
      )}
      key={header.id}
      style={{
        width: header.column.getSize(),
        maxWidth: header.column.columnDef.maxSize || header.column.getSize(),
        minWidth: header.column.columnDef.minSize || header.column.getSize(),
        position: 'relative',
      }}
    >
      {header.isPlaceholder ? null : (
        <span className='flex flex-row items-center justify-start [&>svg]:stroke-primary-500'>
          <span
            className={cn([
              '!aucctus-text-primary flex items-center justify-start',
              {
                'cursor-pointer': header.column.getCanSort(),
                'select-none': header.column.getCanSort(),
              },
            ])}
            onClick={header.column.getToggleSortingHandler()}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {{
              asc: (
                <Icon variant='arrowup' className='ml-1 stroke-primary-800' />
              ),
              desc: (
                <Icon variant='arrowdown' className='ml-1 stroke-primary-800' />
              ),
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
