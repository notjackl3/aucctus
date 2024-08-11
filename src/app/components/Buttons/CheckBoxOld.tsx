import { Icon } from '@components';
import * as Checkbox from '@radix-ui/react-checkbox';
import classNames from 'classnames';
import React, { useRef } from 'react';

interface CheckboxProps extends Checkbox.CheckboxProps, React.RefAttributes<HTMLButtonElement> {
  label?: string;
  labelClassNames?: string;
  indeterminate?: boolean;
}

const CustomCheckbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ id, label, labelClassNames, indeterminate, checked, ...props }, ref) => {
    const internalRef = useRef<HTMLButtonElement>(null);

    // We do not need to manage `indeterminate` state on the element itself
    // Instead, we manage the visual representation

    return (
      <div className='flex items-center'>
        <Checkbox.Root
          ref={ref || internalRef}
          id={id}
          className='flex h-6 w-6 items-center justify-center rounded-md shadow-md hover:border-primary-500 hover:shadow-lg hover:ring-2 focus:border-primary-500 focus:ring-primary-500 focus-visible:outline-primary-500'
          {...props}
        >
          <Checkbox.Indicator className='text-primary-500 [&>svg]:stroke-primary-500'>
            {indeterminate && !checked ? <Icon variant='minus' /> : <Icon variant='check' />}
          </Checkbox.Indicator>
        </Checkbox.Root>
        {label ? (
          <label
            htmlFor={id}
            className={classNames('pl-2 text-base font-medium capitalize leading-tight', labelClassNames)}
          >
            {label}
          </label>
        ) : null}
      </div>
    );
  },
);

CustomCheckbox.displayName = 'CustomCheckbox';

export default CustomCheckbox;
