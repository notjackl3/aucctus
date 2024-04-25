import { FunctionComponent } from 'react';
import styles from './styles/marketDetails.module.scss';
import { useParams } from 'react-router-dom';
import { useConceptMarketScan } from '../../../../hooks/query/concepts.hook';
import EcosystemList from './EcosystemList';
import { useEditMarketScan } from '../../../../hooks/concepts/editable.hook';
import EditModeSwitcher from '../../../../components/Text/EditibleTextView/EditibleTextView';
import TrendAndDriverCard from './TrendAndDriverCard';

const MarketDetails: FunctionComponent = () => {
  const { id: conceptId } = useParams();
  const { data: marketScan } = useConceptMarketScan(conceptId || '');
  const { trendsAndDriversDescription, ecosystemDescription } = useEditMarketScan();

  return (
    <div className={styles.marketDetails}>
      <div className={styles.summary}>
        <div className={styles.detailBlock}>
          <h2>Trends and Drivers</h2>
          <EditModeSwitcher
            containerClassName={styles.textBlock}
            value={trendsAndDriversDescription.value}
            label=""
            name="trendsAndDriversDescription"
            maxLength={trendsAndDriversDescription.validation.maxLength}
            onChange={trendsAndDriversDescription.handleChange}
            handleSave={trendsAndDriversDescription.handleSave}
            handleCancel={trendsAndDriversDescription.handleCancel}
          />
        </div>
      </div>
      <div className={styles.cardContainer}>
        {marketScan?.trendsAndDrivers.map((trend) => (
          <TrendAndDriverCard trendAndDriver={trend} key={trend.uuid} />
        ))}
      </div>
      <div className={styles.summary}>
        <div className={styles.detailBlock}>
          <h2>Ecosystem</h2>
          <EditModeSwitcher
            containerClassName={styles.textBlock}
            value={ecosystemDescription.value}
            label=""
            name="ecosystemDescription"
            maxLength={ecosystemDescription.validation.maxLength}
            onChange={ecosystemDescription.handleChange}
            handleSave={ecosystemDescription.handleSave}
            handleCancel={ecosystemDescription.handleCancel}
          />
        </div>
      </div>
      <div className={styles.cardContainer}>
        <EcosystemList title="Top Startups" data={marketScan?.startups || []} />
        <EcosystemList title="Top Incumbents" data={marketScan?.incumbents || []} />
        <EcosystemList title="Top Investors" data={marketScan?.investors || []} />
      </div>
      {/* TODO add back news when ready */}
      {/* <div className={styles.summary}>
        <div className={styles.detailBlock}>
          <h2>Activity and News</h2>
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
      </div> */}
      {/* This external link is required to be added to the page when using Clearbit logos */}
      <div className={styles.externalLogoLink}>
        <a href="https://clearbit.com" target="_blank" rel="noopener noreferrer">
          Logos provided by Clearbit
        </a>
      </div>
    </div>
  );
};

export default MarketDetails;
