import { FunctionComponent } from 'react';
import styles from './styles/marketDetails.module.scss';
import { IMarketScan } from '../../../../../libs/api/typings';
import Icon from '../../../../components/Icon';
import ConceptDetailCard from '../../../../components/ConceptDetailCard/ConceptDetailCard';
import images from '../../../../assets/img';
import NewsArticle from '../../../../components/NewsArticle';

export interface MarketDetailsProps {
  conceptMarketData?: IMarketScan;
  isConceptMarketLoading?: boolean;
}

const iconDefaultProps = {
  height: 24,
  width: 24,
  stroke: '#2B3674',
};

const MarketDetails: FunctionComponent<MarketDetailsProps> = ({ conceptMarketData }) => {
  const renderTrendCards = (trendDriversList: IMarketScan['trendsAndDrivers']) => {
    return trendDriversList?.map((trend) => (
      <ConceptDetailCard
        title=""
        isHideHeader
        footerAction={
          <button className={styles.cardAction} onClick={() => {}} aria-label="See Source">
            See Source
            <span>{<Icon variant="arrowRight" {...iconDefaultProps} />}</span>
          </button>
        }
      >
        <div className={styles.cardTrendContent}>
          <img alt="delivery-trend" src={images.deliveryTrend} />
          <span className={styles.cardBoldText}>{trend?.name}</span>
          <p className={styles.cardRegularText}>{trend?.description}</p>
        </div>
      </ConceptDetailCard>
    ));
  };

  return (
    <div className={styles.marketDetails}>
      <div className={styles.summary}>
        <div className={styles.detailBlock}>
          <h2>Trends and Drivers</h2>
          <div className={styles.textBlock}>
            <p>{conceptMarketData?.trendsAndDriversDescription}</p>
          </div>
        </div>
      </div>
      <div className={styles.cardContainer}>{renderTrendCards(conceptMarketData?.trendsAndDrivers || [])}</div>
      <div className={styles.summary}>
        <div className={styles.detailBlock}>
          <h2>Ecosystem</h2>
          <div className={styles.textBlock}>
            <p>{conceptMarketData?.ecosystemDescription}</p>
          </div>
        </div>
      </div>
      <div className={styles.cardContainer}>
        <ConceptDetailCard title="Top Startups" isHideFooter>
          <div className={styles.cardContent}>
            <div className={styles.cardRow}>
              <img className={styles.cardLogo} alt="domain-booklet" src={images.companyLogoDefault} />
              <div className={styles.cardDescription}>
                <span className={styles.cardDescriptionTitle}>MyUS</span>
                <p className={styles.cardDescriptionText}>
                  Offers package forwarding services from the US to over 220 countries worldwide, allowing customers to
                  shop from US stores and ship internationally.{' '}
                </p>
              </div>
              <a target="_blank" rel="noopener noreferrer" href={'https://www.google.com'}>
                <Icon variant="linkExternal" width={24} height={24} />
              </a>
            </div>
          </div>
        </ConceptDetailCard>
        <ConceptDetailCard title="Top Incumbents" isHideFooter>
          <div className={styles.cardContent}>
            <div className={styles.cardRow}>
              <img className={styles.cardLogo} alt="domain-booklet" src={images.companyLogoDefault} />
              <div className={styles.cardDescription}>
                <span className={`${styles.cardDescriptionTitle}`}>MyUS</span>
                <p className={`${styles.cardDescriptionText} ${styles.cellEllipsis}`}>
                  Offers package forwarding services from the US to over 220 countries worldwide, allowing customers to
                  shop from US stores and ship internationally.{' '}
                </p>
              </div>
              <a target="_blank" rel="noopener noreferrer" href={'https://www.google.com'}>
                <Icon variant="linkExternal" width={24} height={24} />
              </a>
            </div>
          </div>
        </ConceptDetailCard>
        <ConceptDetailCard title="Top Investors" isHideFooter>
          <div className={styles.cardContent}>
            <div className={styles.cardRow}>
              <img className={styles.cardLogo} alt="company-logo" src={images.companyLogoDefault} />
              <div className={styles.cardDescription}>
                <span className={`${styles.cardDescriptionTitle}`}>Sequoia Capital</span>
                <p className={`${styles.cardDescriptionText} ${styles.cellEllipsis}`}>
                  Known for investments in growth-stage companies across various sectors.
                </p>
              </div>
              <a target="_blank" rel="noopener noreferrer" href={'https://www.google.com'}>
                <Icon variant="linkExternal" width={24} height={24} />
              </a>
            </div>
            <div className={styles.cardRow}>
              <img className={styles.cardLogo} alt="company-logo" src={images.companyLogoDefault} />
              <div className={styles.cardDescription}>
                <span className={`${styles.cardDescriptionTitle}`}>Sequoia Capital</span>
                <p className={`${styles.cardDescriptionText} ${styles.cellEllipsis}`}>
                  Known for investments in growth-stage companies across various sectors.
                </p>
              </div>
              <a target="_blank" rel="noopener noreferrer" href={'https://www.google.com'}>
                <Icon variant="linkExternal" width={24} height={24} />
              </a>
            </div>
          </div>
        </ConceptDetailCard>
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
          newsLink=""
        />
      </div>
    </div>
  );
};

export default MarketDetails;
