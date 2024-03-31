import { FunctionComponent, useMemo } from 'react';
import styles from './styles/marketDetails.module.scss';
import Icon from '../../../../components/Icon';
import ConceptDetailCard from '../../../../components/ConceptDetailCard/ConceptDetailCard';
import images from '../../../../assets/img';
import NewsArticle from '../../../../components/NewsArticle';
import api from '../../../../../libs/api';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';

const iconDefaultProps = {
  height: 24,
  width: 24,
  stroke: '#2B3674',
};

const MarketDetails: FunctionComponent = () => {
  const { id: conceptId } = useParams();

  const { data } = useQuery({
    queryKey: [`concept/${conceptId}/market-scan`],
    retry: 1,
    queryFn: async () => await api.concept.getConceptMarketScan(conceptId || ''),
  });

  const ecosystems = useMemo(
    () => [
      {
        title: 'Top Startups',
        data: data?.startups,
      },
      {
        title: 'Top Incumbents',
        data: data?.incumbents,
      },
      {
        title: 'Top Investors',
        data: data?.investors,
      },
    ],
    [data]
  );

  return (
    <div className={styles.marketDetails}>
      <div className={styles.summary}>
        <div className={styles.detailBlock}>
          <h2>Trends and Drivers</h2>
          <div className={styles.textBlock}>
            <p>{data?.trendsAndDriversDescription}</p>
          </div>
        </div>
      </div>
      <div className={styles.cardContainer}>
        {data?.trendsAndDrivers.map((trend) => (
          <ConceptDetailCard
            title=""
            key={trend.uuid}
            isHideHeader
            footerAction={
              <a
                className="btn btn-light"
                target="_blank"
                rel="noopener noreferrer"
                href={trend.source}
                aria-label="See Source"
              >
                See Source
                <span>{<Icon variant="arrowRight" {...iconDefaultProps} />}</span>
              </a>
            }
          >
            <div className={styles.cardTrendContent}>
              <img alt="delivery-trend" src={images.deliveryTrend} />
              <span className={styles.cardBoldText}>{trend?.name}</span>
              <p className={styles.cardRegularText}>{trend?.description}</p>
            </div>
          </ConceptDetailCard>
        ))}
      </div>
      <div className={styles.summary}>
        <div className={styles.detailBlock}>
          <h2>Ecosystem</h2>
          <div className={styles.textBlock}>
            <p>{data?.ecosystemDescription}</p>
          </div>
        </div>
      </div>
      <div className={styles.cardContainer}>
        {ecosystems.map((ecosystem, index) => (
          <ConceptDetailCard key={`${ecosystem.title}-${index}`} title={ecosystem.title} isHideFooter>
            <div className={styles.cardContent}>
              {ecosystem.data?.map((item) => (
                <div className={styles.cardRow}>
                  <img className={styles.cardLogo} alt="domain-booklet" src={images.companyLogoDefault} />
                  <div className={styles.cardDescription}>
                    <span className={styles.cardDescriptionTitle}>{item.name}</span>
                    <p className={styles.cardDescriptionText}>{item.description}</p>
                  </div>
                  <a target="_blank" rel="noopener noreferrer" href={item.source}>
                    <Icon variant="linkExternal" width={24} height={24} />
                  </a>
                </div>
              ))}
            </div>
          </ConceptDetailCard>
        ))}

        <div className={styles.summary}>
          <div className={styles.detailBlock}>
            <h2>Activity and News</h2>
          </div>
        </div>
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
          newsLink="https://www.google.com/"
        />
      </div>
    </div>
  );
};

export default MarketDetails;
