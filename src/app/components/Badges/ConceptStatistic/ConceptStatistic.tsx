import { FunctionComponent } from 'react';

import styles from './styles/conceptStatistic.module.scss';
import Icon from '../../Icons/Icon/Icon';
import { ConceptStatusIconColor } from '../../../../libs/concepts';

export interface IConceptStatisticProps {
  icon: IconVariant;
  iconColor: ConceptStatusIconColor;
  infoTitle: string;
  infoValue: string;
  infoSubValue?: string;
  variant?: 'opportunity';
}

const defaultIconProps = {
  height: 24,
  width: 24,
  stroke: '#155eef',
};

const ConceptStatistic: FunctionComponent<IConceptStatisticProps> = ({
  infoTitle,
  infoValue,
  infoSubValue,
  iconColor,
  icon,
  variant,
}) => {
  const getAdditionalStatisticStyle = (variant: IConceptStatisticProps['variant']) => {
    switch (variant) {
      case 'opportunity':
        return styles.opportunityStatistic;
      default:
        return '';
    }
  };

  const additionalStyle = getAdditionalStatisticStyle(variant);

  return (
    <div className={`${styles.conceptStatistic} ${additionalStyle}`}>
      <span className={`${styles.conceptIcon} ${styles[`${iconColor}Icon`]}`}>
        <Icon variant={icon} {...defaultIconProps} />
      </span>
      <div className={styles.conceptInfo}>
        <div className={styles.conceptInfoTitle}>{infoTitle}</div>
        <div className={styles.conceptData}>
          <div className={styles.conceptDataNumber}>{infoValue}</div>
          {infoSubValue && <div className={styles.conceptDataInfo}>{infoSubValue}</div>}
        </div>
      </div>
    </div>
  );
};

export default ConceptStatistic;
