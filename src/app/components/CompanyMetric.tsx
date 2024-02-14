import { FunctionComponent } from 'react';
import styles from '../assets/styles/components/company-metric.module.scss';
import Loading from './Loading';
import Icon, { IconVariant } from './Icon';

const defaultIconProps = {
  stroke: '#2B3674',
  width: 24,
  height: 24,
};

interface CompanyMetricProps {
  title: string;
  isLoading?: boolean;
  value?: string | number;
  icon?: keyof typeof IconVariant;

  iconStroke?: string;
}

const CompanyMetric: FunctionComponent<CompanyMetricProps> = ({ title, value, icon = 'target', isLoading = false }) => {
  return (
    <div className={styles.companyMetric}>
      <div className={styles.heading}>
        <Icon variant={icon} {...defaultIconProps} />
        <span className={styles.title}>{isLoading ? <Loading /> : title}</span>
      </div>
      <div>{value !== undefined && value !== null ? <span className={styles.value}>{value}</span> : null}</div>
    </div>
  );
};

export default CompanyMetric;
