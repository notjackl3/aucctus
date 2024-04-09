import { FunctionComponent, useMemo } from 'react';
import styles from './styles/financialDetails.module.scss';
import Icon from '../../../../components/Icon';
import ConceptDetailCard from '../../../../components/ConceptDetailCard/ConceptDetailCard';
import GeneralBadge from '../../../../components/GeneralBadge';
import MarketChart from '../../../../components/MarketChart';
import MarketLegend from '../../../../components/MarketLegend';
import { formatLargeNumber } from '../../../../../libs/utils';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import api from '../../../../../libs/api';
import { getMarketMetricColor, getMarketMetricTitle } from '../../../../../libs/concepts';

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

const FinancialDetails: FunctionComponent = () => {
  const { id: conceptId } = useParams();

  const { data: conceptFinancialData } = useQuery({
    queryKey: [`concept/${conceptId}/financial-projection`],
    retry: 1,
    queryFn: async () => await api.concept.getConceptFinancialProjection(conceptId || ''),
  });

  const marketMetrics = useMemo(() => {
    if (!conceptFinancialData || !conceptFinancialData.marketSizeMetrics) {
      return [];
    }
    return conceptFinancialData.marketSizeMetrics;
  }, [conceptFinancialData]);

  const dataTAM = marketMetrics[0];
  const dataSAM = marketMetrics[1];
  const dataSOM = marketMetrics[2];

  return (
    <div className={styles.financialDetails}>
      <div className={styles.summary}>
        <div className={styles.leftColumn}>
          <div className={styles.detailBlock}>
            <h2>Overview</h2>
            <div className={styles.textBlock}>
              <p>{conceptFinancialData?.overview}</p>
            </div>
          </div>
        </div>
      </div>
      <h2>Potential Market Size</h2>
      <div className={styles.cardContainer}>
        <ConceptDetailCard
          title="Key Hypothesis"
          cardClassName={styles.cardStyle}
          isHideFooter
          headerAction={
            <button className={styles.cardAction} onClick={() => {}} aria-label="Unlock Edit Hypothesis">
              <span>{<Icon variant="lock" {...iconDefaultProps} />}</span>
              AI Generated
            </button>
          }
        >
          <div className={styles.cardContent}>
            <div className={styles.cardRow}>
              <span className={styles.rowText}>{dataTAM?.keyHypothesis}</span>
              <GeneralBadge
                showBullet
                badgeClassName={styles.rowBadge}
                bulletClassName={styles.bulletLightPurple}
                badgeText="1"
              />
            </div>
            <div className={styles.cardRow}>
              <span className={styles.rowText}>{dataSAM?.keyHypothesis}</span>
              <GeneralBadge
                showBullet
                badgeClassName={styles.rowBadge}
                bulletClassName={styles.bulletPurple}
                badgeText="2"
              />
            </div>
            <div className={styles.cardRow}>
              <span className={styles.rowText}>{dataSOM?.keyHypothesis}</span>
              <GeneralBadge
                showBullet
                badgeClassName={styles.rowBadge}
                bulletClassName={styles.bulletBlue}
                badgeText="3"
              />
            </div>
          </div>
        </ConceptDetailCard>
      </div>
      <div className={styles.cardContainer}>
        <ConceptDetailCard title="Market Size Projection" cardClassName={styles.paddedCardStyle} isHideFooter>
          <div className={styles.cardMarketContent}>
            <div className={styles.cardLeft}>
              {marketMetrics.map((metric, i) => (
                <ConceptDetailCard
                  key={`key-hypothesis-${i}`}
                  title={getMarketMetricTitle(metric.metricType)}
                  cardClassName={styles.cardLeftSytle}
                  headerAction={<span>{formatLargeNumber(metric.value)}</span>}
                >
                  <div className={styles.cardLeftContent}>
                    <p className={styles.cardBoldText}>{metric?.keyHypothesis}</p>
                    <p className={styles.cardRegularText}>{metric?.dataPoint}</p>
                  </div>
                </ConceptDetailCard>
              ))}
            </div>
            <div className={styles.cardRight}>
              <MarketChart
                largeValue={dataTAM?.value}
                mediumValue={dataSAM?.value}
                smallValue={dataSOM?.value}
                chartClass={styles.marketChart}
              />
              <div className={styles.legend}>
                {marketMetrics.map((metric, i) => (
                  <MarketLegend
                    key={`$market-metrics-legend-${i}`}
                    legendText={getMarketMetricTitle(metric.metricType)}
                    legendValue={formatLargeNumber(metric.value)}
                    bulletColor={getMarketMetricColor(metric.metricType)}
                  />
                ))}
              </div>
            </div>
          </div>
        </ConceptDetailCard>
      </div>
    </div>
  );
};

export default FinancialDetails;
