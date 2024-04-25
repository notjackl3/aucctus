import { FunctionComponent } from 'react';
import { ITrendsAndDrivers } from '../../../../../libs/api/types';
import styles from './styles/marketDetails.module.scss';
import ConceptDetailCard from '../../../../components/Cards/ConceptDetailCard/ConceptDetailCard';
import Icon from '../../../../components/Icons/Icon/Icon';
import images from '../../../../assets/img';

const iconDefaultProps = {
  height: 24,
  width: 24,
  stroke: '#2B3674',
};

interface ITrendsAndDriversProps {
  trendsAndDrivers: ITrendsAndDrivers[];
}

const TrendsAndDrivers: FunctionComponent<ITrendsAndDriversProps> = ({ trendsAndDrivers }) => {
  return (
    <>
      {trendsAndDrivers.map((trend) => (
        <ConceptDetailCard
          title=""
          key={trend.uuid}
          isHideHeader
          footerAction={
            <button
              className={`${styles.cardAction} btn btn-light`}
              rel="noopener noreferrer"
              aria-label="See Source"
              onClick={(e) => {
                e.preventDefault();
                window.open(trend.source, '_blank');
              }}
            >
              See Source
              <Icon variant="link-external" {...iconDefaultProps} />
            </button>
          }
        >
          <div className={styles.cardTrendContent}>
            <img alt="delivery-trend" src={images.deliveryTrend} />
            <span className={styles.cardBoldText}>{trend?.name}</span>
            <p className={styles.cardRegularText}>{trend?.description}</p>
          </div>
        </ConceptDetailCard>
      ))}
    </>
  );
};

export default TrendsAndDrivers;
