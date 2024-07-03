import { FunctionComponent } from 'react';
import { ITrendsAndDrivers } from '@libs/api/types';
import styles from './styles/marketDetails.module.scss';
import images from '../../../../assets/img';
import { useModal } from '../../../../context/ModalContextProvider';
import EditMarketScanElement from '../../../../components/Modal/EditMarketScanElement/EditMarketScanElement';
import { useTrendAndDriverDelete, useTrendAndDriverUpdate } from '../../../../hooks/query/concepts.hook';
import { Card, Icon } from '@components';

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
  const { mutate: deleteItem } = useTrendAndDriverDelete();
  const { mutate: updateItem } = useTrendAndDriverUpdate();

  return (
    <Card.Detail
      title=''
      key={trendAndDriver.uuid}
      isHideHeader
      footerAction={
        <button
          className={`${styles.cardAction} btn btn-light`}
          rel='noopener noreferrer'
          aria-label='See Source'
          onClick={(e) => {
            e.preventDefault();
            window.open(trendAndDriver.source, '_blank');
          }}
        >
          See Source
          <Icon.Variant variant='link-external' {...iconDefaultProps} />
        </button>
      }
    >
      <div
        className={styles.cardTrendContent}
        onClick={() => openModal(EditMarketScanElement, { item: trendAndDriver, deleteItem, updateItem })}
      >
        <img alt='delivery-trend' src={images.deliveryTrend} />
        <span className={styles.cardBoldText}>{trendAndDriver?.name}</span>
        <p className={styles.cardRegularText}>{trendAndDriver?.description}</p>
      </div>
    </Card.Detail>
  );
};

export default TrendAndDriverCard;
