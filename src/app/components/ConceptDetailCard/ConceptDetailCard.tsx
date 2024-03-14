import { FunctionComponent, ReactNode } from 'react';

import styles from './styles/conceptDetailCard.module.scss';
import Icon, { IconVariant } from '../Icon';

interface ConceptDetailCardProps {
  title: string;
  children: ReactNode;
  headerAction?: ReactNode;
  cardClassName?: string;
  headerClassName?: string;
  icon?: keyof typeof IconVariant;
}

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

const ConceptDetailCard: FunctionComponent<ConceptDetailCardProps> = ({
  title,
  children,
  icon,
  cardClassName,
  headerAction,
}) => {
  return (
    <div className={`${styles.conceptDetailCard} ${cardClassName ? cardClassName : ''}`}>
      <div className={styles.cardHeader}>
        <span className={styles.headerTitle}>
          <span>{icon ? <Icon variant={icon} {...iconDefaultProps} /> : null}</span>
          <h4>{title}</h4>
        </span>
        {headerAction}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default ConceptDetailCard;
