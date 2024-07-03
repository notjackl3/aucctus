import { FunctionComponent } from 'react';
import styles from './financialDetails.module.scss';
import { Badge, Legend, Card, Icon } from '@components';
import MarketChart from '../../../../components/Charts/MarketChart/MarketChart';
import { useParams } from 'react-router-dom';
import { useEditFinancialProjections } from '../../../../hooks/concepts/editable.hook';
import EditModeSwitcher from '../../../../components/Text/EditibleTextView/EditibleTextView';
import Loading from '../../../../components/Loading';

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

const FinancialDetails: FunctionComponent = () => {
  const { id: conceptId } = useParams();
  const { overview, tamKeyHypothesis, samKeyHypothesis, somKeyHypothesis, marketSizeMetric } =
    useEditFinancialProjections();

  return (
    <div className={styles.financialDetails}>
      <div className={styles.summary}>
        <div className={styles.detailBlock}>
          <h2>Overview</h2>
          <EditModeSwitcher
            containerClassName={styles.textBlock}
            value={overview.value}
            name='overview'
            maxLength={overview.validation.maxLength}
            onChange={overview.handleChange}
            handleSave={overview.handleSave}
            handleCancel={overview.handleCancel}
          />
        </div>
      </div>
      <h2>Potential Market Size</h2>
      <div className={styles.cardContainer}>
        <Card.Detail
          title='Key Hypothesis'
          cardClassName={styles.cardStyle}
          isHideFooter
          headerAction={
            <button className='btn btn-light btn-no-border' aria-label='Unlock Edit Hypothesis' disabled>
              <span>{<Icon.Variant variant='lock' {...iconDefaultProps} />}</span>
              AI Generated
            </button>
          }
        >
          <div className={styles.cardContent}>
            <div className={styles.cardRow}>
              <EditModeSwitcher
                pClassName={styles.rowText}
                value={tamKeyHypothesis.value}
                name='keyHypothesis'
                maxLength={tamKeyHypothesis.validation.maxLength}
                onChange={tamKeyHypothesis.handleChange}
                handleSave={tamKeyHypothesis.handleSave}
                handleCancel={tamKeyHypothesis.handleCancel}
              />
              <Badge.Simple showBullet bulletClass='text-primary-200' text='1' />
            </div>
            <div className={styles.cardRow}>
              <EditModeSwitcher
                pClassName={styles.rowText}
                value={samKeyHypothesis.value}
                name='keyHypothesis'
                maxLength={samKeyHypothesis.validation.maxLength}
                onChange={samKeyHypothesis.handleChange}
                handleSave={samKeyHypothesis.handleSave}
                handleCancel={samKeyHypothesis.handleCancel}
              />
              <Badge.Simple showBullet bulletClass='text-primary-400' text='2' />
            </div>
            <div className={styles.cardRow}>
              <EditModeSwitcher
                pClassName={styles.rowText}
                value={somKeyHypothesis.value}
                name='keyHypothesis'
                maxLength={somKeyHypothesis.validation.maxLength}
                onChange={somKeyHypothesis.handleChange}
                handleSave={somKeyHypothesis.handleSave}
                handleCancel={somKeyHypothesis.handleCancel}
              />
              <Badge.Simple showBullet bulletClass='text-blue-600' text='3' />
            </div>
          </div>
        </Card.Detail>
      </div>
      <div className={styles.cardContainer}>
        <Card.Detail title='Market Size Projection' cardClassName={styles.paddedCardStyle} isHideFooter>
          <div className={styles.cardMarketContent}>
            <div className={styles.cardLeft}>
              {marketSizeMetric ? (
                <>
                  <Card.MarketSizeProjections metric={marketSizeMetric.TAM} conceptUuid={conceptId || ''} />
                  <Card.MarketSizeProjections metric={marketSizeMetric.SAM} conceptUuid={conceptId || ''} />
                  <Card.MarketSizeProjections metric={marketSizeMetric.SOM} conceptUuid={conceptId || ''} />
                </>
              ) : (
                <Loading />
              )}
            </div>
            <div className={styles.cardRight}>
              <MarketChart
                className={styles.marketChart}
                tam={marketSizeMetric?.TAM?.value || 0}
                sam={marketSizeMetric?.SAM?.value || 0}
                som={marketSizeMetric?.SOM?.value || 0}
              />
              <Legend.MarketLegend
                tam={marketSizeMetric?.TAM?.value || 0}
                sam={marketSizeMetric?.SAM?.value || 0}
                som={marketSizeMetric?.SOM?.value || 0}
              />
            </div>
          </div>
        </Card.Detail>
      </div>
    </div>
  );
};

export default FinancialDetails;
