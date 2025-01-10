import images from '@assets/img';
import { Card, Icon } from '@components';
import EditMarketScanElement from '@components/Modal/MarketScanElement/EditMarketScanElement';
import { useModal } from '@context/ModalContextProvider';
import {
  useTrendAndDriverDelete,
  useTrendAndDriverUpdate,
} from '@hooks/query/concepts.hook';
import { ITrendsAndDriversV1 } from '@libs/api/types';
import { FunctionComponent } from 'react';
import styles from './styles/marketDetails.module.scss';

const iconDefaultProps = {
  height: 24,
  width: 24,
  stroke: '#2B3674',
};

interface ITrendsAndDriversProps {
  trendAndDriver: ITrendsAndDriversV1;
}

const TrendAndDriverCard: FunctionComponent<ITrendsAndDriversProps> = ({
  trendAndDriver,
}) => {
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
            let source = trendAndDriver.source;

            // TODO: TEMP
            if (!source || source.trim() === '') {
              source = trendAndDriver.sources[0];
            }

            window.open(source, '_blank');
          }}
        >
          See Source
          <Icon variant='link-external' {...iconDefaultProps} />
        </button>
      }
    >
      <div
        className={styles.cardTrendContent}
        onClick={() =>
          openModal(EditMarketScanElement, {
            item: trendAndDriver,
            // @ts-ignore TODO: Fix type definition for EditMarketScanElement props
            deleteItem,
            // @ts-ignore
            updateItem,
          })
        }
      >
        <img alt='delivery-trend' src={images.deliveryTrend} />
        <span className={styles.cardBoldText}>{trendAndDriver?.name}</span>
        <p className={styles.cardRegularText}>{trendAndDriver?.description}</p>
      </div>
    </Card.Detail>
  );
};

export default TrendAndDriverCard;
