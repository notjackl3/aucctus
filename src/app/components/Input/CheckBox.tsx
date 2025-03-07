import {
  FunctionComponent,
  InputHTMLAttributes,
  useEffect,
  useRef,
} from 'react';

export interface TableCheckBoxProps
  extends InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
}

const TableCheckBox: FunctionComponent<TableCheckBoxProps> = ({
  indeterminate,
  checked,
  ...rest
}) => {
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
      className='aucctus-border-primary h-4 w-4 appearance-none rounded-md border bg-gray-100 checked:border-indigo-600 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:ring-offset-2'
      {...rest}
    />
  );
};

export default TableCheckBox;
