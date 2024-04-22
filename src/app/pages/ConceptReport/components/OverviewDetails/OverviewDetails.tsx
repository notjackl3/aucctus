import { FunctionComponent, useMemo } from 'react';
import styles from './styles/overviewDetails.module.scss';
import ConceptDetailCard from '../../../../components/ConceptDetailCard/ConceptDetailCard';
import MarketChart from '../../../../components/MarketChart';
import MarketLegend from '../../../../components/MarketLegend';
import defaultAvatar from '../../../../assets/avatar.svg';
import Icon from '../../../../components/Icon/Icon';
// import NewsArticle from '../../../../components/NewsArticle';
import Loading from '../../../../components/Loading';
import { useQuery } from 'react-query';
import api from '../../../../../libs/api';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppPath } from '../../../../../routes/routes';
import { getMarketMetricColor, getMarketMetricTitle } from '../../../../../libs/concepts';
import { formatLargeNumber } from '../../../../../libs/utils';
import KeyAssumptionCard from './components/KeyAssumptionCard';

export interface OverviewDetailsProps {}

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

const OverviewDetails: FunctionComponent = () => {
  const { id: conceptId = '' } = useParams();
  const location = useLocation();
  const basePath = location.pathname.split('/').slice(0, 3).join('/');

  const navigate = useNavigate();

  //TODO remove these queries when overview endpoint modified to return all data required for overview page
  const { data: conceptData } = useQuery({
    queryKey: [`concepts/${conceptId}`],
    retry: 1,
    queryFn: async () => await api.concept.getConcept(conceptId || ''),
  });

  const { data: conceptOverviewData, isLoading: isConceptLoading } = useQuery({
    queryKey: [`concept/overview/${conceptId}`],
    retry: 1,
    queryFn: async () => await api.concept.getConceptOverview(conceptId || ''),
  });

  const { data: conceptAssumptionData } = useQuery({
    queryKey: ['concepts/key-assumptions'],
    refetchOnWindowFocus: false,
    retry: 1,
    queryFn: async () => {
      return api.concept.getConceptKeyAssumptions(conceptId || '');
    },
  });

  const keyAssumptions = useMemo(() => {
    if (!conceptAssumptionData || !conceptAssumptionData.results) {
      return [];
    }
    return conceptAssumptionData.results;
  }, [conceptAssumptionData]);

  const firstCustomerPersona = useMemo(() => {
    if (!conceptOverviewData || !conceptOverviewData.persona) {
      return undefined;
    }
    return conceptOverviewData.persona;
  }, [conceptOverviewData]);

  const marketSizeMetrics = useMemo(() => {
    if (
      !conceptOverviewData ||
      !conceptOverviewData.financialProjection ||
      !conceptOverviewData.financialProjection.marketSizeMetrics
    ) {
      return [];
    }
    return conceptOverviewData.financialProjection.marketSizeMetrics;
  }, [conceptOverviewData]);

  const renderIndustriesList = () => {
    return conceptOverviewData?.industries?.map((industry, i) => <p key={`industry-${i}`}>{industry}</p>);
  };

  const renderTrendAndDriversList = () => {
    return conceptOverviewData?.trendsAndDrivers?.map((trend, i) => <p key={`trend-${i}`}>{trend}</p>);
  };

  return (
    <div className={styles.overviewDetails}>
      <div className={styles.summary}>
        <div className={styles.leftColumn}>
          <div className={styles.summaryBlock}>
            <h3>Value Proposition</h3>
            <div className={styles.textBlock}>
              <p>{conceptOverviewData?.valueProposition}</p>
            </div>
          </div>
          <div className={styles.detailBlock}>
            <h3>Overview</h3>
            <p>{conceptData?.description}</p>
            <div className={styles.overview}></div>
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.listSection}>
            <div className={styles.detailBlock}>
              <h3>Trends & Drivers</h3>
              {isConceptLoading && <Loading />}
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
          title="Customer Profiles"
          subtitle="Breakdown of target user pain points and jobs to be done"
          cardClassName={styles.cardStyle}
          footerAction={
            <button
              className={styles.cardAction}
              onClick={() => {
                navigate(
                  `${AppPath.ConceptCustomerPersona.replace(':id', conceptId)}?persona=${
                    firstCustomerPersona?.nickname
                  }`
                );
              }}
              aria-label="View Customer Profiles"
            >
              <span>{<Icon variant="user-group" width={16} height={16} stroke="#626BA3" />}</span>
              View Profile
            </button>
          }
        >
          <div className={styles.cardContent}>
            <div className={styles.customerCard}>
              <div className={styles.avatarSection}>
                <img className={styles.avatar} alt="avatar" src={defaultAvatar} />
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
                      <Icon variant="globe" {...iconDefaultProps} />
                      {`Geographic Location: ${firstCustomerPersona?.geoLocation || ''}`}
                    </p>
                    <p>
                      <Icon variant="umbrella" {...iconDefaultProps} />
                      {`Age Range: ${firstCustomerPersona?.ageRange || ''}`}
                    </p>
                    <p>
                      <Icon variant="user-group" {...iconDefaultProps} />
                      {`Family Size: ${firstCustomerPersona?.familySize || ''}`}
                    </p>
                    <p>
                      <Icon variant="piggy-bank" {...iconDefaultProps} />
                      {`Average Income: ${firstCustomerPersona?.incomeRange || ''}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ConceptDetailCard>
        <ConceptDetailCard
          title="Financial Projection"
          subtitle="Market size estimate based on initial hypothesis"
          cardClassName={styles.cardStyle}
          footerAction={
            <button
              className={styles.cardAction}
              onClick={() => {
                navigate(`${basePath}/financial-projection`);
              }}
              aria-label="View Financial Projection"
            >
              <span>{<Icon variant="line-chart-up" width={16} height={16} stroke="#626BA3" />}</span>
              View Projections
            </button>
          }
        >
          <div className={styles.cardContent}>
            <MarketChart
              largeValue={marketSizeMetrics[0]?.value}
              mediumValue={marketSizeMetrics[1]?.value}
              smallValue={marketSizeMetrics[2]?.value}
              chartClass={styles.marketChart}
            />
            <div className={styles.legendGroup}>
              {marketSizeMetrics.map((metric, i) => (
                <MarketLegend
                  key={`$market-metrics-legend-${i}`}
                  legendClassName={styles.financeLegend}
                  legendTextClassName={styles.legendText}
                  legendText={getMarketMetricTitle(metric.metricType)}
                  legendValue={formatLargeNumber(metric.value)}
                  bulletColor={getMarketMetricColor(metric.metricType)}
                />
              ))}
            </div>
          </div>
        </ConceptDetailCard>
        <KeyAssumptionCard keyAssumptions={keyAssumptions} conceptId={conceptId} />
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
