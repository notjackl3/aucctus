import { ForwardRefRenderFunction, InputHTMLAttributes } from 'react';

import styles from './checkbox.module.scss';
import React from 'react';

interface CheckBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  supportingText: string;
}

const Box: ForwardRefRenderFunction<HTMLInputElement, CheckBoxProps> = ({ name, supportingText, ...props }, ref) => {
  return (
    <div className={styles.checkbox}>
      <input {...props} type="checkbox" ref={ref} name={name} />

      <span>{supportingText}</span>
    </div>
  );
};

const Checkbox = React.forwardRef(Box);

export default Checkbox;
