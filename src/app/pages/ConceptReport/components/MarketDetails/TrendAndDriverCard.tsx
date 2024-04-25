import { FunctionComponent } from 'react';
import { ITrendsAndDrivers } from '../../../../../libs/api/types';
import styles from './styles/marketDetails.module.scss';
import ConceptDetailCard from '../../../../components/Cards/ConceptDetailCard/ConceptDetailCard';
import Icon from '../../../../components/Icons/Icon/Icon';
import images from '../../../../assets/img';
import { useModal } from '../../../../context/modal/ModalContextProvider';
import EditTrendAndDriver from '../../../../components/Modal/EditTrendsAndDrivers/EditTrendAndDriver';

const iconDefaultProps = {
  height: 24,
  width: 24,
  stroke: '#2B3674',
};

interface ITrendsAndDriversProps {
  trendAndDriver: ITrendsAndDrivers;
}

const TrendAndDriverCard: FunctionComponent<ITrendsAndDriversProps> = ({ trendAndDriver }) => {
  const { openModal } = useModal();

  return (
    <ConceptDetailCard
      title=""
      key={trendAndDriver.uuid}
      isHideHeader
      footerAction={
        <button
          className={`${styles.cardAction} btn btn-light`}
          rel="noopener noreferrer"
          aria-label="See Source"
          onClick={(e) => {
            e.preventDefault();
            window.open(trendAndDriver.source, '_blank');
          }}
        >
          See Source
          <Icon variant="link-external" {...iconDefaultProps} />
        </button>
      }
    >
      <div className={styles.cardTrendContent} onClick={() => openModal(EditTrendAndDriver, { trendAndDriver })}>
        <img alt="delivery-trend" src={images.deliveryTrend} />
        <span className={styles.cardBoldText}>{trendAndDriver?.name}</span>
        <p className={styles.cardRegularText}>{trendAndDriver?.description}</p>
      </div>
    </ConceptDetailCard>
  );
};

export default TrendAndDriverCard;
