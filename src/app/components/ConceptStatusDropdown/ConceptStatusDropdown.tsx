import { FunctionComponent } from 'react';

import styles from './styles/conceptStatusDropdown.module.scss';
import { ConceptStatus as ConceptStatusType } from '../../../libs/api/typings';
import { snakeCaseToTitleCase } from '../../../libs/utils';
import Icon from '../Icon';
import { getConceptStatusColor } from '../../../libs/concepts';

export interface ConceptStatusDropdownProps {
  status: ConceptStatusType;
  isActive?: Boolean;
}

const defaultIconProps = {
  stroke: '#667085',
  width: 24,
  height: 24,
};
const ConceptStatusDropdown: FunctionComponent<ConceptStatusDropdownProps> = ({ status, isActive }) => {
  const color = getConceptStatusColor(status);

  return (
    <div className={`${styles.conceptStatusDropdown} ${styles[`${color}Background`]}`}>
      {isActive && <span className={styles[`${color}Bullet`]}>●</span>}
      <span className={`${styles.status} ${styles[`${color}Status`]}`}>{snakeCaseToTitleCase(status)}</span>
      {isActive && <Icon className={`${styles[`${color}Bullet`]}`} variant="chevronDown" {...defaultIconProps} />}
    </div>
  );
};

export default ConceptStatusDropdown;
