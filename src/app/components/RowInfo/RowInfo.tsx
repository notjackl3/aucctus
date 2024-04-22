import { FunctionComponent } from 'react';

import styles from './styles/rowInfo.module.scss';
import Tooltip from '../Tooltip/Tooltip';

export interface RowInfoProps {
  label: string;
  sublabel?: string;
  render: React.ReactNode;
  tooltipContent?: string;
}

const RowInfo: FunctionComponent<RowInfoProps> = ({ label, sublabel, render, tooltipContent }) => {
  return (
    <div className={styles.rowInfo}>
      <div className={styles.rowInfoDescription}>
        {label && (
          <div className={styles.rowInfoTitle}>
            {label}
            {tooltipContent && <Tooltip content={tooltipContent} />}
          </div>
        )}
        {sublabel && <div className={styles.rowInfoSublabel}>{sublabel}</div>}
      </div>
      {render}
    </div>
  );
};

export default RowInfo;
