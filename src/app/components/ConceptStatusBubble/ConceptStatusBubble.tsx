import { FunctionComponent, useMemo } from 'react';

import styles from './styles/conceptStatus.module.scss';
import { ConceptStatus } from '../../../libs/api/typings';
import { getConceptStatusColor } from '../../../libs/concepts';
import Icon from '../Icon/Icon';
import { camelCaseToTitleCase } from '../../../libs/utils';

type ConceptStatusVariant = 'bubble' | 'dropdown';
export interface IConceptStatusBubbleProps {
  status: ConceptStatus;
  isActive?: Boolean;
  variant?: ConceptStatusVariant;
}

const defaultIconProps = {
  width: 24,
  height: 24,
};

const ConceptStatusBubble: FunctionComponent<IConceptStatusBubbleProps> = ({
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
      {showBullet ? <span className={styles.bullet}>●</span> : null}
      <span className={styles.status}>{camelCaseToTitleCase(status)}</span>
      {showChevronDown ? <Icon variant="chevrondown" {...defaultIconProps} /> : null}
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
