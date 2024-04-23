import { FunctionComponent, InputHTMLAttributes, useEffect, useRef } from 'react';

import styles from './styles/tableCheckBox.module.scss';

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
    <div className={styles.tableCheckBox}>
      <input type="checkbox" ref={ref} checked={checked} {...rest} />
    </div>
  );
};

export default TableCheckBox;
