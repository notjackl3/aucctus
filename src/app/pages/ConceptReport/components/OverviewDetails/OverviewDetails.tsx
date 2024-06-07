import { FunctionComponent, useMemo } from 'react';
import styles from './overviewDetails.module.scss';
import ConceptDetailCard from '../../../../components/Cards/ConceptDetailCard/ConceptDetailCard';
import MarketChart from '../../../../components/Charts/MarketChart/MarketChart';
import MarketLegend from '../../../../components/Legends/MarketLegend/MarketLegend';
import defaultAvatar from '../../../../assets/avatar.svg';
import Icon from '../../../../components/Icons/Icon/Icon';
import { useParams, useOutletContext } from 'react-router-dom';
import { AppPath } from '../../../../../routes/routes';

import KeyAssumptionCard from './KeyAssumptionCard';
import { IConceptReportContext } from '../../ConceptReport';
import { useConceptAssumptions, useConceptOverview } from '../../../../hooks/query/concepts.hook';
import { IMarketSizeMetric } from '../../../../../libs/api/types';
import EditModeSwitcher from '../../../../components/Text/EditibleTextView/EditibleTextView';
import { useEditConcept, useEditOverview } from '../../../../hooks/concepts/editable.hook';

interface IMetricSizes {
  TAM: IMarketSizeMetric;
  SAM: IMarketSizeMetric;
  SOM: IMarketSizeMetric;
}

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

const OverviewDetails: FunctionComponent = () => {
  const { id: conceptId = '' } = useParams();
  const { navigateToTab } = useOutletContext<IConceptReportContext>();
  const { overview } = useConceptOverview(conceptId);
  const { assumptions } = useConceptAssumptions(conceptId);
  const { valueProposition, problemStatement } = useEditOverview();
  const descriptionEdit = useEditConcept();

  const firstCustomerPersona = useMemo(() => {
    if (!overview || !overview.persona) {
      return undefined;
    }
    return overview.persona;
  }, [overview]);

  /**
   * Calculates and returns the market size metrics based on the overview and financial projection data.
   *
   * @returns The market size metrics object containing TAM, SAM, and SOM.
   */
  const marketSizeMetrics = useMemo(() => {
    if (!overview || !overview.financialProjection) {
      return undefined;
    }

    const marketSizes = overview.financialProjection.marketSizeMetrics.reduce((acc: Partial<IMetricSizes>, metric) => {
      acc[metric.metricType] = metric;
      return acc;
    }, {});

    if (!marketSizes.TAM || !marketSizes.SAM || !marketSizes.SOM) {
      return undefined;
    }

    return marketSizes as IMetricSizes;
  }, [overview]);

  const renderIndustriesList = () => {
    return overview?.industries?.map((industry, i) => <p key={`industry-${i}`}>{industry}</p>);
  };

  const renderTrendAndDriversList = () => {
    return overview?.trendsAndDrivers?.map((trend, i) => <p key={`trend-${i}`}>{trend}</p>);
  };

  return (
    <div className={styles.overviewDetails}>
      <div className={styles.summary}>
        <div className={styles.leftColumn}>
          <div className={styles.summaryBlock}>
            <h3>Value Proposition</h3>
            <EditModeSwitcher
              containerClassName={styles.textBlock}
              value={valueProposition.value}
              label=''
              name='valueProposition'
              maxLength={valueProposition.validation.maxLength}
              onChange={valueProposition.handleChange}
              handleSave={valueProposition.handleSave}
              handleCancel={valueProposition.handleCancel}
            />
          </div>
          <div className={styles.detailBlock}>
            <h3>Overview</h3>
            <EditModeSwitcher
              value={descriptionEdit.value}
              label=''
              name='description'
              maxLength={descriptionEdit.validation.maxLength}
              onChange={descriptionEdit.handleChange}
              handleSave={descriptionEdit.handleSave}
              handleCancel={descriptionEdit.handleCancel}
            />
          </div>

          {overview?.problemStatement ? (
            <div className={styles.detailBlock}>
              <h3>Problem Statement</h3>
              <EditModeSwitcher
                value={problemStatement.value}
                label=''
                name='description'
                maxLength={problemStatement.validation.maxLength}
                onChange={problemStatement.handleChange}
                handleSave={problemStatement.handleSave}
                handleCancel={problemStatement.handleCancel}
              />
            </div>
          ) : null}
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.listSection}>
            <div className={styles.detailBlock}>
              <h3>Trends & Drivers</h3>
              <div className={styles.list}>{renderTrendAndDriversList()}</div>
            </div>
            <div className={styles.detailBlock}>
              <h3>Industries</h3>
              <div className={styles.list}>{renderIndustriesList()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cardContentContainer}>
        <ConceptDetailCard
          title='Customer Profiles'
          subtitle='Breakdown of target user pain points and jobs to be done'
          cardClassName={styles.cardStyle}
          footerAction={
            <button
              className={styles.cardAction}
              onClick={() => {
                navigateToTab(AppPath.ConceptCustomerProfile);
              }}
              aria-label='View Customer Profiles'
            >
              <span>{<Icon variant='user-group' width={16} height={16} stroke='#626BA3' />}</span>
              View Profile
            </button>
          }
        >
          <div className={styles.cardContent}>
            <div className={styles.customerCard}>
              <div className={styles.avatarSection}>
                <img className={styles.avatar} alt='avatar' src={defaultAvatar} />
                <div className={styles.avatarDetails} onClick={() => {}}>
                  <span className={styles.description}>{firstCustomerPersona?.nickname}</span>
                  <span className={styles.name}>{firstCustomerPersona?.name}</span>
                </div>
              </div>
              <div className={styles.listSection}>
                <div className={styles.customerDetailBlock}>
                  <h2 className={styles.demographicHeader}>Demographics</h2>
                  <div className={styles.list}>
                    <p>
                      <Icon variant='globe' {...iconDefaultProps} />
                      {`Geographic Location: ${firstCustomerPersona?.geoLocation || ''}`}
                    </p>
                    <p>
                      <Icon variant='umbrella' {...iconDefaultProps} />
                      {`Age Range: ${firstCustomerPersona?.ageRange || ''}`}
                    </p>
                    <p>
                      <Icon variant='user-group' {...iconDefaultProps} />
                      {`Family Size: ${firstCustomerPersona?.familySize || ''}`}
                    </p>
                    <p>
                      <Icon variant='piggy-bank' {...iconDefaultProps} />
                      {`Average Income: ${firstCustomerPersona?.incomeRange || ''}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ConceptDetailCard>
        <ConceptDetailCard
          title='Financial Projection'
          subtitle='Market size estimate based on initial hypothesis'
          cardClassName={styles.cardStyle}
          footerAction={
            <button
              className={styles.cardAction}
              onClick={() => {
                navigateToTab(AppPath.ConceptFinancialProjection);
              }}
              aria-label='View Financial Projection'
            >
              <span>{<Icon variant='line-chart-up' width={16} height={16} stroke='#626BA3' />}</span>
              View Projections
            </button>
          }
        >
          <div className={styles.cardContent}>
            {marketSizeMetrics ? (
              <>
                <MarketChart
                  className={styles.marketChart}
                  tam={marketSizeMetrics.TAM.value}
                  sam={marketSizeMetrics.SAM.value}
                  som={marketSizeMetrics.SOM.value}
                />

                <MarketLegend
                  tam={marketSizeMetrics.TAM.value}
                  sam={marketSizeMetrics.SAM.value}
                  som={marketSizeMetrics.SOM.value}
                />
              </>
            ) : (
              'No financial projection data available'
            )}
          </div>
        </ConceptDetailCard>
        <KeyAssumptionCard keyAssumptions={assumptions?.results || []} />
      </div>
      {/* <div className={styles.summary}>
        <h2>Activity and News</h2>
      </div>
      <div className={styles.newsContainer}>
        <NewsArticle
          newsTitle={`Rapid Delivery & Logistics Retail Business, 'Buggy,' Launches Equity Crowdfunding Round on Frontfund`}
          newsDescription={`Buggy, Canada's leading rapid retail logistics company, is excited to announce its equity crowdfunding round on Frontfundr."With an experienced team, strong strategic partnerships and focus on path to profitability in this space, we're excited to offer the opportunity for individuals to invest in our growth through our equity crowdfunding round on Frontfundr," said Nicole Verkindt, CEO of Buggy.`}
          newsLink="https://www.google.com/"
        />
        <NewsArticle
          newsTitle={`Rapid Delivery & Logistics Retail Business, 'Buggy,' Launches Equity Crowdfunding Round on Frontfund`}
          newsDescription={`Buggy, Canada's leading rapid retail logistics company, is excited to announce its equity crowdfunding round on Frontfundr."With an experienced team, strong strategic partnerships and focus on path to profitability in this space, we're excited to offer the opportunity for individuals to invest in our growth through our equity crowdfunding round on Frontfundr," said Nicole Verkindt, CEO of Buggy.`}
          newsLink=""
        />
      </div> */}
    </div>
  );
};

export default OverviewDetails;
