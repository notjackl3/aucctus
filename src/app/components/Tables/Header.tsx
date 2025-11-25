import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { Header, flexRender } from '@tanstack/react-table';
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
  const [isResizing, setIsResizing] = React.useState(false);

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
        'aucctus-text-primary aucctus-border-secondary aucctus-bg-primary text-nowrap border-b border-r p-3 align-top text-base font-medium leading-normal first:pl-6 last:pr-6',
        props.className,
      )}
      key={header.id}
      style={{
        width: header.column.getSize(),
        maxWidth: header.column.columnDef.maxSize || header.column.getSize(),
        minWidth: header.column.columnDef.minSize || header.column.getSize(),
        position: 'sticky',
        top: 0,
        zIndex: 10,
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
                asc: (
                  <Icon variant='arrowup' className='ml-1 stroke-primary-800' />
                ),
                desc: (
                  <Icon
                    variant='arrowdown'
                    className='ml-1 stroke-primary-800'
                  />
                ),
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
            'absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none',
            'hover:aucctus-bg-brand-primary transition-opacity hover:opacity-100',
            'opacity-0',
            {
              'aucctus-bg-brand-secondary !opacity-100':
                header.column.getIsResizing(),
            },
          )}
          style={{
            transform: 'translateX(50%)',
            zIndex: 20,
          }}
        />
      )}
    </th>
  );
};

export default TableHeader;
