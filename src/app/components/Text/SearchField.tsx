import { Icon } from '@components';
import React, { InputHTMLAttributes, useEffect, useState } from 'react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  debounce?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({ debounce = 500, onChange, ...props }) => {
  const [value, setValue] = useState(props.value || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) {
        const event = {
          target: {
            value: value,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    }, debounce);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounce, onChange]);

  return (
    <div className='relative w-full max-w-md'>
      <div className='absolute inset-y-0 left-0 flex items-center pl-3 [&>svg]:stroke-primary-500'>
        <Icon.Variant variant='search-refraction' />
      </div>
      <input
        {...props}
        type='text'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus-visible:outline-primary-500 sm:text-sm'
        placeholder='Search...'
      />
    </div>
  );
};

export default SearchInput;
