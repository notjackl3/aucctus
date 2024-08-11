import { FunctionComponent, InputHTMLAttributes, useEffect, useRef } from 'react';

export interface TableCheckBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
}

const TableCheckBox: FunctionComponent<TableCheckBoxProps> = ({ indeterminate, checked, ...rest }) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      if (ref.current) {
        ref.current.indeterminate = !checked && indeterminate;
      }
    }
  }, [ref, indeterminate, checked]);

  return (
    <input
      type='checkbox'
      ref={ref}
      checked={checked}
      className='h-4 w-4 appearance-none rounded-md border border-gray-300 bg-gray-100 checked:border-indigo-600 checked:bg-indigo-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
      {...rest}
    />
  );
};

export default TableCheckBox;
