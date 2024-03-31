import { FunctionComponent, useMemo } from 'react';

import styles from './styles/conceptStatus.module.scss';
import { ConceptStatus as ConceptStatusType } from '../../../libs/api/typings';
import { snakeCaseToTitleCase } from '../../../libs/utils';
import { getConceptStatusColor } from '../../../libs/concepts';
import Icon from '../Icon';

type ConceptStatusVariant = 'bubble' | 'dropdown';
export interface IConceptStatusProps {
  status: ConceptStatusType;
  isActive?: Boolean;
  variant?: ConceptStatusVariant;
}

const defaultIconProps = {
  width: 24,
  height: 24,
};

const ConceptStatusBubble: FunctionComponent<IConceptStatusProps> = ({
  status,
  variant = 'bubble',
  isActive = false,
}) => {
  const showChevronDown = useMemo(() => isActive && variant === 'dropdown', [isActive, variant]);
  const showBullet = useMemo(() => showChevronDown || variant === 'bubble', [variant, showChevronDown]);

  const color = getConceptStatusColor(status);
  const statusStyle = getStatusStyle(variant);

  return (
    <div className={`${statusStyle} ${styles[`${color}Background`]}`}>
      {showBullet ? <span>●</span> : null}
      <span className={styles.status}>{snakeCaseToTitleCase(status)}</span>
      {showChevronDown ? <Icon variant="chevronDown" {...defaultIconProps} /> : null}
    </div>
  );
};

function getStatusStyle(variant: ConceptStatusVariant) {
  switch (variant) {
    case 'bubble':
      return styles.conceptStatus;
    case 'dropdown':
      return styles.conceptStatusDropdown;
    default:
      return styles.conceptStatus;
  }
}

export default ConceptStatusBubble;
