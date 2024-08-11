import { Icon } from '@components';
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
      className='text-nowrap p-2 align-top text-base font-medium leading-normal text-indigo-900 first:pl-3 last:pr-4'
      key={header.id}
    >
      {header.isPlaceholder ? null : (
        <div className='flex flex-col items-center justify-start text-center'>
          <div
            className={classNames([
              'flex items-center justify-center',
              {
                'cursor-pointer': header.column.getCanSort(),
                'select-none': header.column.getCanSort(),
              },
            ])}
            onClick={header.column.getToggleSortingHandler()}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {{
              asc: <Icon variant='arrowup' className='ml-1' />,
              desc: <Icon variant='arrowdown' className='ml-1' />,
            }[header.column.getIsSorted() as string] ?? null}
          </div>
          {header.column.getCanFilter() ? (
            <div className='mt-2'>
              <Filter column={header.column} />
            </div>
          ) : null}
        </div>
      )}
    </th>
  );
};

// Filter Component (unchanged)
function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <DebouncedInput
      type='text'
      value={(columnFilterValue ?? '') as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      className='w-36 rounded border shadow'
    />
  );
}

// DebouncedInput Component (unchanged)
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}

export default TableHeader;
