import { Icon, Input } from '@components';
import React from 'react';
import { cn } from '@libs/utils/react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  debounce?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({ ...props }) => {
  const [focus, setFocus] = React.useState(false);

  return (
    <div className='relative w-full max-w-md'>
      <div className='absolute inset-y-0 left-0 flex items-center pl-3'>
        <Icon
          variant='search-md'
          className={cn({
            'stroke-gray-light-500': !focus,
            'stroke-primary-900': focus,
          })}
        />
      </div>
      <Input
        {...props}
        type='text'
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className='aucctus-border-primary group block w-full rounded-lg border py-2 pl-10 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0'
        placeholder='Search...'
      />
    </div>
  );
};

export default SearchInput;
