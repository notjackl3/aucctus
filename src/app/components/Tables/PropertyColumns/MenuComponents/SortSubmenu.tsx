import React from 'react';
import { ArrowDown, ArrowUp, Check } from 'lucide-react';

interface ISortSubmenuProps {
  currentSort?: 'asc' | 'desc' | null;
  onSort: (direction: 'asc' | 'desc') => void;
}

/**
 * Sort submenu flyout component
 * Displays ascending/descending sort options
 */
export const SortSubmenu: React.FC<ISortSubmenuProps> = ({
  currentSort,
  onSort,
}) => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary w-[200px] rounded-lg border p-1 shadow-lg'>
      <button
        className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSort('asc');
        }}
      >
        <ArrowUp className='aucctus-stroke-secondary h-4 w-4' />
        <span className='aucctus-text-secondary'>Ascending</span>
        {currentSort === 'asc' && (
          <Check className='aucctus-stroke-brand-primary ml-auto h-4 w-4' />
        )}
      </button>

      <button
        className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSort('desc');
        }}
      >
        <ArrowDown className='aucctus-stroke-secondary h-4 w-4' />
        <span className='aucctus-text-secondary'>Descending</span>
        {currentSort === 'desc' && (
          <Check className='aucctus-stroke-brand-primary ml-auto h-4 w-4' />
        )}
      </button>
    </div>
  );
};
