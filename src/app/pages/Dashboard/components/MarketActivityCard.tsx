import { FunctionComponent } from 'react';

import styles from '../styles/dashboard.module.scss';
import ConceptDetailCard from '../../../components/ConceptDetailCard/ConceptDetailCard';
import NewsArticle from '../../../components/NewsArticle';

export interface NewsData {
  newsTitle: string;
  newsDescription: string;
  newsLink: string;
}

export interface DashboardOpportunityCardProps {
  newsData?: NewsData[];
}

// TODO Remove this temporary data once the API is available
const NEWS_DATA_TEMP: NewsData[] = [
  {
    newsTitle: `Rapid Delivery & Logistics Retail Business, 'Buggy,' Launches Equity Crowdfunding Round on Frontfund`,
    newsDescription: `Buggy, Canada's leading rapid retail logistics company, is excited to announce its equity crowdfunding round on Frontfundr."With an experienced team, strong strategic partnerships and focus on path to profitability in this space, we're excited to offer the opportunity for individuals to invest in our growth through our equity crowdfunding round on Frontfundr," said Nicole Verkindt, CEO of Buggy.`,
    newsLink: 'https://www.google.com/',
  },
  {
    newsTitle: `Rapid Delivery & Logistics Retail Business, 'Buggy,' Launches Equity Crowdfunding Round on Frontfund`,
    newsDescription: `Buggy, Canada's leading rapid retail logistics company, is excited to announce its equity crowdfunding round on Frontfundr."With an experienced team, strong strategic partnerships and focus on path to profitability in this space, we're excited to offer the opportunity for individuals to invest in our growth through our equity crowdfunding round on Frontfundr," said Nicole Verkindt, CEO of Buggy.`,
    newsLink: 'https://www.google.com/',
  },
];

const MarketActivityCard: FunctionComponent<DashboardOpportunityCardProps> = ({ newsData = NEWS_DATA_TEMP }) => {
  const renderOpportunityRows = newsData.map((news) => (
    <div className={styles.cardRow}>
      <NewsArticle
        newsTitle={news.newsTitle}
        newsDescription={news.newsDescription}
        newsLink={news.newsLink}
        newsAricleClassName={styles.noBorder}
      />
    </div>
  ));

  return (
    <ConceptDetailCard title="Market Activity" cardClassName={styles.cardStyle} isHideFooter>
      <div className={styles.cardContent}>{renderOpportunityRows}</div>
    </ConceptDetailCard>
  );
};

export default MarketActivityCard;
