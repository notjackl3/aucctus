import { FunctionComponent, useMemo } from 'react';
import styles from './styles/overviewDetails.module.scss';
import ConceptDetailCard from '../../../../components/ConceptDetailCard/ConceptDetailCard';
import MarketChart from '../../../../components/MarketChart';
import MarketLegend from '../../../../components/MarketLegend';
import defaultAvatar from '../../../../assets/icons/avatar.svg';
import Icon from '../../../../components/Icon';
import NewsArticle from '../../../../components/NewsArticle';
import Loading from '../../../../components/Loading';
import { useQuery } from 'react-query';
import api from '../../../../../libs/api';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export interface OverviewDetailsProps {}

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

const OverviewDetails: FunctionComponent = () => {
  const { id: conceptId } = useParams();
  const location = useLocation();
  const basePath = location.pathname.split('/').slice(0, 4).join('/');

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

  const { data: conceptCustomerData } = useQuery({
    queryKey: [`concept/${conceptId}/customer-profile`],
    retry: 1,
    queryFn: async () => await api.concept.getConceptCustomerProfiles(conceptId || ''),
  });

  const firstCustomerPrersona = useMemo(() => {
    if (!conceptCustomerData || (conceptCustomerData && !conceptCustomerData.results)) {
      return undefined;
    }
    return conceptCustomerData.results[0];
  }, [conceptCustomerData]);

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
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.detailBlock}>
            <h3>Overview</h3>
            <p>{conceptData?.description}</p>
            <div className={styles.overview}></div>
          </div>
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
                navigate(`${basePath}/customer-profile`);
              }}
              aria-label="View Customer Profiles"
            >
              <span>{<Icon variant="userGroup" width={16} height={16} stroke="#626BA3" />}</span>
              View Profile
            </button>
          }
        >
          <div className={styles.cardContent}>
            <div className={styles.customerCard}>
              <div className={styles.avatarSection}>
                <img className={styles.avatar} alt="avatar" src={defaultAvatar} />
                <div className={styles.avatarDetails} onClick={() => {}}>
                  <span className={styles.description}>{firstCustomerPrersona?.nickname}</span>
                  <span className={styles.name}>{firstCustomerPrersona?.name}</span>
                </div>
              </div>
              <div className={styles.listSection}>
                <div className={styles.customerDetailBlock}>
                  <h2 className={styles.demographicHeader}>Demographics</h2>
                  <div className={styles.list}>
                    <p>
                      <Icon variant="globe" {...iconDefaultProps} />
                      {`Geographic Location: ${firstCustomerPrersona?.geoLocation || ''}`}
                    </p>
                    <p>
                      <Icon variant="umbrella" {...iconDefaultProps} />
                      {`Age Range: ${firstCustomerPrersona?.ageRange || ''}`}
                    </p>
                    <p>
                      <Icon variant="userGroup" {...iconDefaultProps} />
                      {`Family Size: ${firstCustomerPrersona?.familySize || ''}`}
                    </p>
                    <p>
                      <Icon variant="piggyBank" {...iconDefaultProps} />
                      {`Average Income: ${firstCustomerPrersona?.incomeRange || ''}`}
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
              <span>{<Icon variant="lineChartUp" width={16} height={16} stroke="#626BA3" />}</span>
              View Projections
            </button>
          }
        >
          <div className={styles.cardContent}>
            <MarketChart
              largeValue={1400300}
              mediumValue={1010300}
              smallValue={30300}
              chartClass={styles.marketChart}
            />
            <div className={styles.legendGroup}>
              <MarketLegend
                legendClassName={styles.financeLegend}
                legendTextClassName={styles.legendText}
                legendText="Total Addressable Market"
                legendValue="2.8M"
                bulletColor="purple"
              />
              <MarketLegend
                legendClassName={styles.financeLegend}
                legendTextClassName={styles.legendText}
                legendText="Serviceable Addressable Market"
                legendValue="560K"
                bulletColor="darkPurple"
              />
              <MarketLegend
                legendClassName={styles.financeLegend}
                legendTextClassName={styles.legendText}
                legendText="Serviceable Obtainable Market"
                legendValue="56K"
                bulletColor="blue"
              />
            </div>
          </div>
        </ConceptDetailCard>
      </div>
      <div className={styles.summary}>
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
      </div>
    </div>
  );
};

export default OverviewDetails;
