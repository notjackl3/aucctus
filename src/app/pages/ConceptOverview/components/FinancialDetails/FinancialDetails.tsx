import { FunctionComponent } from 'react';
import styles from './styles/financialDetails.module.scss';
import { IConcept, IFinancialProjection } from '../../../../../libs/api/typings';
import Icon from '../../../../components/Icon';
import ConceptDetailCard from '../../../../components/ConceptDetailCard/ConceptDetailCard';
import GeneralBadge from '../../../../components/GeneralBadge';
import MarketChart from '../../../../components/MarketChart';
import MarketLegend from '../../../../components/MarketLegend';
import { formatLargeNumber } from '../../../../../libs/utils';

export interface FinancialDetailsProps {
  conceptData?: IConcept;
  conceptFinancialData?: IFinancialProjection;
}

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

const FinancialDetails: FunctionComponent<FinancialDetailsProps> = ({ conceptFinancialData }) => {
  const dataTAM = conceptFinancialData?.marketSizeMetrics?.[0];
  const dataSAM = conceptFinancialData?.marketSizeMetrics?.[1];
  const dataSOM = conceptFinancialData?.marketSizeMetrics?.[2];

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
                badgeClassName={styles.rowBadge}
                bulletClassName={styles.bulletLightPurple}
                badgeText="TAM"
              />
            </div>
            <div className={styles.cardRow}>
              <span className={styles.rowText}>{dataSAM?.keyHypothesis}</span>
              <GeneralBadge badgeClassName={styles.rowBadge} bulletClassName={styles.bulletPurple} badgeText="SAM" />
            </div>
            <div className={styles.cardRow}>
              <span className={styles.rowText}>{dataSOM?.keyHypothesis}</span>
              <GeneralBadge badgeClassName={styles.rowBadge} bulletClassName={styles.bulletBlue} badgeText="SOM" />
            </div>
          </div>
        </ConceptDetailCard>
      </div>
      <div className={styles.cardContainer}>
        <ConceptDetailCard title="Market Size Projection" cardClassName={styles.paddedCardStyle} isHideFooter>
          <div className={styles.cardMarketContent}>
            <div className={styles.cardLeft}>
              <ConceptDetailCard
                title="Total Addressable Market"
                cardClassName={styles.cardLeftSytle}
                headerAction={<span>{formatLargeNumber(dataTAM?.value)}</span>}
              >
                <div className={styles.cardLeftContent}>
                  <p className={styles.cardBoldText}>{dataTAM?.keyHypothesis}</p>
                  <p className={styles.cardRegularText}>{dataTAM?.dataPoint}</p>
                </div>
              </ConceptDetailCard>
              <ConceptDetailCard
                title="Serviceable Addressable Market"
                cardClassName={styles.cardLeftSytle}
                headerAction={<span>{formatLargeNumber(dataSAM?.value)}</span>}
                isHideFooter
              >
                <div className={styles.cardLeftContent}>
                  <p className={styles.cardBoldText}>{dataSAM?.keyHypothesis}</p>
                  <p className={styles.cardRegularText}>{dataSAM?.dataPoint}</p>
                </div>
              </ConceptDetailCard>
              <ConceptDetailCard
                title="Serviceable Obtainable Market"
                cardClassName={styles.cardLeftSytle}
                headerAction={<span>{formatLargeNumber(dataSOM?.value)}</span>}
                isHideFooter
              >
                <div className={styles.cardLeftContent}>
                  <p className={styles.cardBoldText}>{dataSOM?.keyHypothesis}</p>
                  <p className={styles.cardRegularText}>{dataSOM?.dataPoint}</p>
                </div>
              </ConceptDetailCard>
            </div>
            <div className={styles.cardRight}>
              <MarketChart
                largeValue={dataTAM?.value}
                mediumValue={dataSAM?.value}
                smallValue={dataSOM?.value}
                chartClass={styles.marketChart}
              />
              <div className={styles.legend}>
                <MarketLegend
                  legendText="Total Addressable Market"
                  legendValue={formatLargeNumber(dataTAM?.value)}
                  bulletColor="purple"
                />
                <MarketLegend
                  legendText="Serviceable Addressable Market"
                  legendValue={formatLargeNumber(dataSAM?.value)}
                  bulletColor="darkPurple"
                />
                <MarketLegend
                  legendText="Serviceable Obtainable Market"
                  legendValue={formatLargeNumber(dataSOM?.value)}
                  bulletColor="blue"
                />
              </div>
            </div>
          </div>
        </ConceptDetailCard>
      </div>
    </div>
  );
};

export default FinancialDetails;
