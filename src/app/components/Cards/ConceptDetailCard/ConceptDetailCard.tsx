import { FunctionComponent, ReactNode } from 'react';

import styles from './conceptDetailCard.module.scss';
import Icon from '../../Icons/Icon/Icon';

interface ConceptDetailCardProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isHideHeader?: boolean;
  isHideFooter?: boolean;
  headerAction?: ReactNode;
  footerAction?: ReactNode;
  cardClassName?: string;
  headerClassName?: string;
  icon?: IconVariant;
}

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

const ConceptDetailCard: FunctionComponent<ConceptDetailCardProps> = ({
  title,
  subtitle,
  children,
  icon,
  cardClassName,
  headerAction,
  isHideHeader,
  isHideFooter,
  footerAction,
  ...rest
}) => {
  return (
    <div {...rest} className={`${styles.conceptDetailCard} ${cardClassName ? cardClassName : ''}`}>
      {!isHideHeader && (
        <div className={styles.cardHeader}>
          <span className={styles.headerTitle}>
            <h4>
              {icon && <span className={styles.cardIcon}>{<Icon variant={icon} {...iconDefaultProps} />}</span>}
              {title}
            </h4>
            {subtitle && <h5>{subtitle}</h5>}
          </span>
          {headerAction}
        </div>
      )}
      <div className={styles.content}>{children}</div>
      {!isHideFooter && <div className={styles.cardFooter}>{footerAction}</div>}
    </div>
  );
};

export default ConceptDetailCard;
