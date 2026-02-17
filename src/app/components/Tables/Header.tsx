import { cn } from '@libs/utils/react';
import { Header, flexRender } from '@tanstack/react-table';
import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

// Column IDs that should be pinned to the right when horizontal scroll is active
const PINNED_RIGHT_COLUMNS = ['actions', 'settings'];
// Width of the settings column (rightmost pinned column)
const SETTINGS_COLUMN_WIDTH = 60;

// Props for the TableHeader component
interface ITableHeaderProps<T>
  extends React.HTMLAttributes<HTMLTableHeaderCellElement> {
  header: Header<T, unknown>;
  /** When true, action columns will be pinned to the right */
  hasHorizontalScroll?: boolean;
}

// TableHeader Component
const TableHeader: React.FC<ITableHeaderProps<any>> = <T,>({
  header,
  hasHorizontalScroll = false,
  ...props
}: ITableHeaderProps<T>) => {
  const [isResizing, setIsResizing] = React.useState(false);

  const columnId = header.column.id;
  const isPinnedColumn = PINNED_RIGHT_COLUMNS.includes(columnId);
  const shouldPin = hasHorizontalScroll && isPinnedColumn;

  // Calculate right offset: settings = 0, actions = 60 (width of settings column)
  const rightOffset =
    columnId === 'settings'
      ? 0
      : columnId === 'actions'
        ? SETTINGS_COLUMN_WIDTH
        : 0;

  // Apply global cursor style during resize and handle mouseup anywhere
  React.useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const handleMouseUp = () => setIsResizing(false);
      const handleTouchEnd = () => setIsResizing(false);

      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [isResizing]);

  return (
    <th
      {...props}
      className={cn(
        'aucctus-text-primary aucctus-border-secondary aucctus-bg-primary-hover text-nowrap border-b p-3 align-top text-base font-medium leading-normal transition-colors first:pl-8 last:pr-4 hover:border-l hover:border-r',
        props.className,
      )}
      key={header.id}
      style={{
        width: header.column.getSize(),
        maxWidth: header.column.columnDef.maxSize || header.column.getSize(),
        minWidth: header.column.columnDef.minSize || header.column.getSize(),
        position: 'sticky',
        top: 0,
        right: shouldPin ? `${rightOffset}px` : undefined,
        // Higher z-index when pinned right (sticky both top AND right)
        zIndex: shouldPin ? 30 : 10,
        // Explicit background for pinned headers matching the header's background
        // aucctus-bg-primary-hover uses bg-base-white = #FFFFFF
        backgroundColor: shouldPin ? '#FFFFFF' : undefined,
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
            onClick={
              header.column.getCanSort()
                ? header.column.getToggleSortingHandler()
                : undefined
            }
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {header.column.getCanSort() &&
              ({
                asc: <ArrowUp className='ml-1 stroke-primary-800' />,
                desc: <ArrowDown className='ml-1 stroke-primary-800' />,
              }[header.column.getIsSorted() as string] ??
                null)}
          </span>
        </span>
      )}

      {/* Resize handle - highest z-index to take precedence over drag/drop */}
      {header.column.getCanResize() && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation(); // Prevent drag from starting
            setIsResizing(true);
            header.getResizeHandler()(e);
          }}
          onTouchStart={(e) => {
            e.stopPropagation(); // Prevent drag from starting
            setIsResizing(true);
            header.getResizeHandler()(e);
          }}
          className={cn(
            'absolute top-0 h-full w-3 cursor-col-resize touch-none select-none',
            'hover:aucctus-bg-brand-primary transition-opacity hover:opacity-100',
            'opacity-0',
            {
              'aucctus-bg-brand-secondary !opacity-100':
                header.column.getIsResizing(),
            },
          )}
          style={{
            right: '-6px',
            zIndex: 20,
          }}
        />
      )}
    </th>
  );
};

export default TableHeader;
