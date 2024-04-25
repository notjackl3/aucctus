import { FunctionComponent, ReactNode } from 'react';

import styles from '../assets/styles/components/concept-card.module.scss';
import Icon from './Icons/Icon/Icon';

interface ConceptCardProps {
  title: string;
  subtitle: string;

  width?: number;
  children: ReactNode;
  icon?: IconVariant;
  buttonTitle: string;
  actionButtonProps?: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
}

const ConceptCard: FunctionComponent<ConceptCardProps> = ({
  title,
  subtitle,
  width,
  children,
  buttonTitle,
  icon,
  actionButtonProps,
}) => {
  return (
    <div className={styles.cardContainer} style={width ? { width } : {}}>
      <div className={styles.cardHeader}>
        <h4>{title}</h4>
        <span>{subtitle}</span>
      </div>
      <div className={styles.content}>{children}</div>
      <div className={styles.footer}>
        <button className="btn btn-light" {...actionButtonProps}>
          {icon ? <Icon variant={icon} /> : null}
          {buttonTitle}
        </button>
      </div>
    </div>
  );
};

export default ConceptCard;
