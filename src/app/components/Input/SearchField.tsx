import { Icon, Input } from '@components';
import classNames from 'classnames';
import React from 'react';

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
          className={classNames({
            'stroke-tertiary-700': !focus,
            'stroke-primary-500': focus,
          })}
        />
      </div>
      <Input
        {...props}
        type='text'
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className='group block w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 shadow-sm outline-transparent ring-0 focus:border-primary-500  focus-visible:outline-primary-500 sm:text-sm'
        placeholder='Search...'
      />
    </div>
  );
};

export default SearchInput;
