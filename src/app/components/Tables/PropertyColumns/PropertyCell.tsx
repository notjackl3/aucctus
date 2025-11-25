import { IPropertyDefinition } from '@libs/api/types';
import React from 'react';

interface IPropertyCellProps {
  value: any;
  definition: IPropertyDefinition;
}

/**
 * Renders a property cell value based on its type
 * Handles: text, number, select, multi_select, checkbox
 */
const PropertyCell: React.FC<IPropertyCellProps> = ({ value, definition }) => {
  // Handle empty/null values
  if (value === null || value === undefined) {
    return <span className='aucctus-text-quaternary text-sm'>—</span>;
  }

  switch (definition.propertyType) {
    case 'text':
      return (
        <span className='aucctus-text-primary text-sm'>{String(value)}</span>
      );

    case 'number':
      return (
        <span className='aucctus-text-primary text-sm'>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      );

    case 'select':
      return (
        <span className='aucctus-bg-brand-solid aucctus-text-white inline-flex items-center rounded-full px-2 py-1 text-xs font-medium'>
          {String(value)}
        </span>
      );

    case 'multi_select': {
      const values = Array.isArray(value) ? value : [];
      if (values.length === 0) {
        return <span className='aucctus-text-quaternary text-sm'>—</span>;
      }
      return (
        <div className='flex flex-wrap gap-1'>
          {values.map((val: string, idx: number) => (
            <span
              key={idx}
              className='aucctus-bg-brand-solid aucctus-text-white inline-flex items-center rounded-full px-2 py-1 text-xs font-medium'
            >
              {String(val)}
            </span>
          ))}
        </div>
      );
    }

    case 'checkbox':
      return (
        <div className='flex items-center justify-start'>
          {value === true ? (
            <svg
              className='aucctus-stroke-success-primary h-5 w-5'
              fill='none'
              strokeWidth={2}
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M5 13l4 4L19 7'
              />
            </svg>
          ) : (
            <svg
              className='aucctus-stroke-quaternary h-5 w-5'
              fill='none'
              strokeWidth={2}
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          )}
        </div>
      );

    default:
      return (
        <span className='aucctus-text-primary text-sm'>{String(value)}</span>
      );
  }
};

export default PropertyCell;
