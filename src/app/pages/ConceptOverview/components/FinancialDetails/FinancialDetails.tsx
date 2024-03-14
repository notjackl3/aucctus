import { FunctionComponent } from 'react';
import styles from './styles/financialDetails.module.scss';
import { IConcept } from '../../../../../libs/api/typings';
import Icon from '../../../../components/Icon';
import ConceptDetailCard from '../../../../components/ConceptDetailCard/ConceptDetailCard';
import GeneralBadge from '../../../../components/GeneralBadge';
import MarketChart from '../../../../components/MarketChart';
import MarketLegend from '../../../../components/MarketLegend';

export interface FinancialDetailsProps {
  conceptData?: IConcept;
}

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

const FinancialDetails: FunctionComponent<FinancialDetailsProps> = ({ conceptData }) => {
  //TODO remove financial data with financial data response
  return (
    <div className={styles.financialDetails}>
      <div className={styles.summary}>
        <div className={styles.leftColumn}>
          <div className={styles.detailBlock}>
            <h2>Overview</h2>
            <div className={styles.textBlock}>
              <p>{conceptData?.description}</p>
            </div>
          </div>
        </div>
      </div>
      <h2>Potential Market Size</h2>
      <div className={styles.cardContainer}>
        <ConceptDetailCard
          title="Key Hypothesis"
          cardClassName={styles.cardStyle}
          headerAction={
            <button className={styles.cardAction} onClick={() => {}} aria-label="Unlock Edit Hypothesis">
              <span>{<Icon variant="lock" {...iconDefaultProps} />}</span>
              AI Generated
            </button>
          }
        >
          <div className={styles.cardContent}>
            <div className={styles.cardRow}>
              <span className={styles.rowText}>
                20% of Canadians living abroad would be interested in and could afford the service.
              </span>
              <GeneralBadge
                badgeClassName={styles.rowBadge}
                bulletClassName={styles.bulletLightPurple}
                badgeText="TAM"
              />
            </div>
            <div className={styles.cardRow}>
              <span className={styles.rowText}>
                Assumed a 10% capture rate of the SAM based on competitive factors and operational capabilities.{' '}
              </span>
              <GeneralBadge badgeClassName={styles.rowBadge} bulletClassName={styles.bulletPurple} badgeText="SAM" />
            </div>
            <div className={styles.cardRow}>
              <span className={styles.rowText}>
                Used an estimated number of Canadians living abroad, 2.8M, which may fluctuate based on immigration
                trends and policies.{' '}
              </span>
              <GeneralBadge badgeClassName={styles.rowBadge} bulletClassName={styles.bulletBlue} badgeText="SOM" />
            </div>
          </div>
        </ConceptDetailCard>
      </div>
      <div className={styles.cardContainer}>
        <ConceptDetailCard title="Market Size Projection" cardClassName={styles.paddedCardStyle}>
          <div className={styles.cardMarketContent}>
            <div className={styles.cardLeft}>
              <ConceptDetailCard
                title="Total Addressable Market"
                cardClassName={styles.cardLeftSytle}
                headerAction={<span>2.8M</span>}
              >
                <div className={styles.cardLeftContent}>
                  <p className={styles.cardBoldText}>
                    We're considering all Canadians living abroad as potential users. Data Point: According to
                    Statistics Canada and various sources, there are approximately 2.8 million Canadians living abroad.{' '}
                  </p>
                  <p className={styles.cardRegularText}>
                    Data Point: According to Statistics Canada and various sources, there are approximately 2.8 million
                    Canadians living abroad.{' '}
                  </p>
                </div>
              </ConceptDetailCard>
              <ConceptDetailCard
                title="Serviceable Addressable Market"
                cardClassName={styles.cardLeftSytle}
                headerAction={<span>560k</span>}
              >
                <div className={styles.cardLeftContent}>
                  <p className={styles.cardBoldText}>
                    Not all Canadians abroad will be interested or have the need for such a service. Based on market
                    research or surveys, assume that 20% of the expatriate population would be interested in and able to
                    afford this service.{' '}
                  </p>
                  <p className={styles.cardRegularText}>Data Point: 20% of 2.8 million. </p>
                </div>
              </ConceptDetailCard>
              <ConceptDetailCard
                title="Serviceable Obtainable Market"
                cardClassName={styles.cardLeftSytle}
                headerAction={<span>56k</span>}
              >
                <div className={styles.cardLeftContent}>
                  <p className={styles.cardBoldText}>
                    Given the competitive landscape and assuming a phased rollout starting with English-speaking
                    countries where most expatriates live, we estimate that within the first few years, you can capture
                    10% of the SAM. Data Point: 10% of the SAM.{' '}
                  </p>
                  <p className={styles.cardRegularText}>Data Point: 10% of the SAM. </p>
                </div>
              </ConceptDetailCard>
            </div>
            <div className={styles.cardRight}>
              <MarketChart largeValue="2.8M" mediumValue="560K" smallValue="56K" chartClass={styles.marketChart} />
              <div className={styles.legend}>
                <MarketLegend legendText="Total Addressable Market" legendValue="2.8M" bulletColor="purple" />
                <MarketLegend legendText="Serviceable Addressable Market" legendValue="560K" bulletColor="darkPurple" />
                <MarketLegend legendText="Serviceable Obtainable Market" legendValue="56K" bulletColor="blue" />
              </div>
            </div>
          </div>
        </ConceptDetailCard>
      </div>
    </div>
  );
};

export default FinancialDetails;
