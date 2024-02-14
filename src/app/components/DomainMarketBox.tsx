import { FunctionComponent } from 'react';

import styles from '../assets/styles/components/domain-market-box.module.scss';
import FeatureIcon from './FeatureIcon';

interface DomainMarketBoxProps {
  title: string;
  description: string;
}

const DomainMarketBox: FunctionComponent<DomainMarketBoxProps> = ({ title, description }) => {
  return (
    <div className={styles.domainMarketBox}>
      {/* <div className={styles.iconContainer}> */}
      <FeatureIcon icon={'target'} color={'purple'} />
      {/* </div> */}

      <div className={styles.supportingText}>
        <h3>{title}</h3>
        <span>{description}</span>
      </div>
    </div>
  );
};

export default DomainMarketBox;
