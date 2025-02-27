import { cn } from '@libs/utils/react';
import { flexRender, Row } from '@tanstack/react-table';
import React from 'react';

// Props for the TableHeader component
interface ITableRowProps<T> extends React.HTMLAttributes<HTMLTableRowElement> {
  row: Row<T>;
  handleClick?: (rowId: string) => void;
  isSelected: boolean;
  center?: boolean;
}

// TableHeader Component
const TableRow: React.FC<ITableRowProps<any>> = <T,>({
  row,
  handleClick,
  isSelected = false,
  ...props
}: ITableRowProps<T>) => {
  return (
    <tr
      {...props}
      className={cn(
        'aucctus-border-secondary table-row h-auto cursor-pointer border-b border-solid transition-colors duration-200 ',
        {
          // The from-** styles are used so that the the expandable text can inherit these colors and they are all in one place
          'bg-primary-100 from-primary-100': isSelected,
          'bg-white odd:bg-white even:bg-primary-10': !isSelected,
        },
        props.className,
      )}
      key={`row-${row.id}`}
      onClick={() => handleClick && handleClick(row.id)}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          className='break-words bg-inherit p-3 text-base font-normal first:pl-6 last:pr-6'
          key={`cell-${cell.id}`}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

export default TableRow;
