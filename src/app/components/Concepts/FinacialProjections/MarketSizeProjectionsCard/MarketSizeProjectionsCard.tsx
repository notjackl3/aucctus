import { IMarketSizeMetric } from '../../../../../libs/api/types';
import { getMarketMetricTitle } from '../../../../../libs/concepts';
import { formatter } from '../../../../../libs/utils';
import { useModal } from '../../../../context/modal/ModalContextProvider';
import ConceptDetailCard from '../../../Cards/ConceptDetailCard/ConceptDetailCard';
import MarketSizeMetricEditModal from '../../../Modal/MarketSizeMetricEditModal/MarketSizeMetricEditModal';

import styles from './market-size-projections.module.scss';

interface IMarketSizeProjectionsCardProps {
  conceptUuid: string;
  metric: IMarketSizeMetric;
}

const MarketSizeProjectionsCard: React.FC<IMarketSizeProjectionsCardProps> = ({ metric, conceptUuid }) => {
  const { openModal, setShouldCloseOnOverlayClickClick } = useModal();
  return (
    <ConceptDetailCard
      title={getMarketMetricTitle(metric.metricType)}
      cardClassName={styles.cardLeftStyle}
      headerAction={<span>{formatter.format(metric.value)}</span>}
      onClick={(e) => {
        e.preventDefault();
        setShouldCloseOnOverlayClickClick(false);

        openModal(MarketSizeMetricEditModal, {
          conceptUuid,
          metric,
        });
      }}
    >
      <div className={styles.cardLeftContent}>
        <p className={styles.cardBoldText}>{metric?.reason}</p>
        <p className={styles.cardRegularText}>{metric?.dataPoint}</p>
      </div>
    </ConceptDetailCard>
  );
};

export default MarketSizeProjectionsCard;
