import { cn } from '@libs/utils/react';
import { flexRender, Row } from '@tanstack/react-table';
import React from 'react';

// Column IDs that should be pinned to the right when horizontal scroll is active
const PINNED_RIGHT_COLUMNS = ['actions', 'settings'];
// Width of the settings column (rightmost pinned column)
const SETTINGS_COLUMN_WIDTH = 60;

// Row background colors from Tailwind config
const ROW_COLORS = {
  selected: '#EBE9E9', // primary-100
  white: '#FFFFFF', // white (odd rows)
  alternate: '#FAF8F8', // primary-10 (even rows)
};

// Props for the TableRow component
interface ITableRowProps<T> extends React.HTMLAttributes<HTMLTableRowElement> {
  row: Row<T>;
  handleClick?: (rowId: string) => void;
  isSelected: boolean;
  center?: boolean;
  /** When true, action columns will be pinned to the right */
  hasHorizontalScroll?: boolean;
}

// TableRow Component
const TableRow: React.FC<ITableRowProps<any>> = <T,>({
  row,
  handleClick,
  isSelected = false,
  hasHorizontalScroll = false,
  ...props
}: ITableRowProps<T>) => {
  // Get row index for odd/even background color calculation
  const rowIndex = row.index;
  const isEvenRow = rowIndex % 2 === 1; // 0-indexed, so index 1, 3, 5... are "even" in CSS terms

  // Determine the row's background color for pinned cells
  const getRowBackgroundColor = () => {
    if (isSelected) return ROW_COLORS.selected;
    return isEvenRow ? ROW_COLORS.alternate : ROW_COLORS.white;
  };

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
      {row.getVisibleCells().map((cell) => {
        const columnId = cell.column.id;
        const isPinnedColumn = PINNED_RIGHT_COLUMNS.includes(columnId);
        const shouldPin = hasHorizontalScroll && isPinnedColumn;

        // Calculate right offset: settings = 0, actions = 60 (width of settings column)
        const rightOffset =
          columnId === 'settings'
            ? 0
            : columnId === 'actions'
              ? SETTINGS_COLUMN_WIDTH
              : 0;

        return (
          <td
            className={cn('break-words p-3 text-base font-normal first:pl-4', {
              'border-r border-primary-100 !p-0': columnId === 'select',
              'bg-inherit': !shouldPin,
            })}
            style={{
              width: cell.column.getSize(),
              maxWidth: cell.column.columnDef.maxSize || cell.column.getSize(),
              minWidth: cell.column.columnDef.minSize || cell.column.getSize(),
              position: shouldPin ? 'sticky' : 'relative',
              right: shouldPin ? `${rightOffset}px` : undefined,
              zIndex: shouldPin ? 10 : undefined,
              // Pinned cells need explicit background matching the row's background
              backgroundColor: shouldPin ? getRowBackgroundColor() : undefined,
            }}
            key={`cell-${cell.id}`}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
};

export default TableRow;
