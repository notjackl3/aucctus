import { FunctionComponent } from 'react';

import styles from '../assets/styles/components/domain-box.module.scss';
import images from '../assets/img';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../routes/routes';
import Icon from './Icon';

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#7586a9',
};

interface DomainBoxProps {
  id: string;
  title: string;
  overview: string;
  totalAddressableMarket: number | string;
  compoundAnnualGrowth: number | string;
  ventureCapitalInvestment?: number | string;
}

const DomainBox: FunctionComponent<DomainBoxProps> = ({
  id,
  title,
  overview,
  totalAddressableMarket,
  compoundAnnualGrowth,
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <img alt="domain-booklet" src={images.domainBooklet} />
          <div className={styles.supportingText}>
            <span className={styles.title}>{title}</span>
            <span className={styles.overview}>{overview}</span>
          </div>
        </div>

        <div className={styles.importantMetrics}>
          <span className={styles.metricHeader}>Important Metrics</span>

          <div className={styles.metric}>
            <div>
              <Icon variant="globe" {...iconDefaultProps} />
              <span>Total Addressable Market (TAM)</span>
            </div>
            <span>{totalAddressableMarket} /year</span>
          </div>

          <div className={styles.metric}>
            <div>
              <Icon variant="lineChartUp" {...iconDefaultProps} />
              <span>Compound Annual Growth Rate (CAGR)</span>
            </div>
            <span>{compoundAnnualGrowth}% /year</span>
          </div>
        </div>
      </div>
      <div className={styles.actionable}>
        <div>
          {/* // TEMP Disable
          <div className={styles.newDomain}> */}
          {/* <ThreeStarIcon {...iconDefaultProps} stroke="#039855" />
          New Domain */}
        </div>

        <button
          className={`btn btn-light`}
          onClick={() => {
            navigate(AppPath.DomainMarket.replace(':id', id), {});
          }}
        >
          Explore Domain
          <Icon variant="arrowRight" {...iconDefaultProps} stroke="#626ba3" />
        </button>
      </div>
    </div>
  );
};

export default DomainBox;
