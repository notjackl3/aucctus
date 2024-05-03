import { FunctionComponent } from 'react';
import styles from './financialDetails.module.scss';
import Icon from '../../../../components/Icons/Icon/Icon';
import ConceptDetailCard from '../../../../components/Cards/ConceptDetailCard/ConceptDetailCard';
import GeneralBadge from '../../../../components/Badges/GeneralBadge/GeneralBadge';
import MarketChart from '../../../../components/Charts/MarketChart/MarketChart';
import MarketLegend from '../../../../components/Legends/MarketLegend/MarketLegend';
import { useParams } from 'react-router-dom';
import { useEditFinancialProjections } from '../../../../hooks/concepts/editable.hook';
import EditModeSwitcher from '../../../../components/Text/EditibleTextView/EditibleTextView';
import MarketSizeProjectionsCard from '../../../../components/Concepts/FinacialProjections/MarketSizeProjectionsCard/MarketSizeProjectionsCard';
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
        <ConceptDetailCard
          title='Key Hypothesis'
          cardClassName={styles.cardStyle}
          isHideFooter
          headerAction={
            <button className={styles.cardAction} aria-label='Unlock Edit Hypothesis' disabled>
              <span>{<Icon variant='lock' {...iconDefaultProps} />}</span>
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
              <GeneralBadge
                showBullet
                badgeClassName={styles.rowBadge}
                bulletClassName={styles.bulletLightPurple}
                badgeText='1'
              />
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
              <GeneralBadge
                showBullet
                badgeClassName={styles.rowBadge}
                bulletClassName={styles.bulletPurple}
                badgeText='2'
              />
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
              <GeneralBadge
                showBullet
                badgeClassName={styles.rowBadge}
                bulletClassName={styles.bulletBlue}
                badgeText='3'
              />
            </div>
          </div>
        </ConceptDetailCard>
      </div>
      <div className={styles.cardContainer}>
        <ConceptDetailCard title='Market Size Projection' cardClassName={styles.paddedCardStyle} isHideFooter>
          <div className={styles.cardMarketContent}>
            <div className={styles.cardLeft}>
              {marketSizeMetric ? (
                <>
                  <MarketSizeProjectionsCard metric={marketSizeMetric.TAM} conceptUuid={conceptId || ''} />
                  <MarketSizeProjectionsCard metric={marketSizeMetric.SAM} conceptUuid={conceptId || ''} />
                  <MarketSizeProjectionsCard metric={marketSizeMetric.SOM} conceptUuid={conceptId || ''} />
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
              <MarketLegend
                tam={marketSizeMetric?.TAM?.value || 0}
                sam={marketSizeMetric?.SAM?.value || 0}
                som={marketSizeMetric?.SOM?.value || 0}
              />

              {/* <div className={styles.legend}>
                {Object.values(marketSizeMetric || {}).map((metric, i) => (
                  <MarketLegend
                    key={`$market-metrics-legend-${i}`}
                    legendText={getMarketMetricTitle(metric.metricType)}
                    legendValue={formatter.format(metric.value)}
                    bulletColor={getMarketMetricColor(metric.metricType)}
                  />
                ))}
              </div> */}
            </div>
          </div>
        </ConceptDetailCard>
      </div>
    </div>
  );
};

export default FinancialDetails;
