import { FunctionComponent } from 'react';
import styles from './styles/marketDetails.module.scss';
import { useParams } from 'react-router-dom';
import { useConceptMarketScan, useTrendAndDriverCreate } from '../../../../hooks/query/concepts.hook';
import EcosystemList from './EcosystemList';
import { useEditMarketScan } from '../../../../hooks/concepts/editable.hook';
import EditModeSwitcher from '../../../../components/Text/EditModeSwitcher/EditModeSwitcher';
import TrendAndDriverCard from './TrendAndDriverCard';
import Icon from '../../../../components/Icons/Icon/Icon';
import { useModal } from '../../../../context/ModalContextProvider';
import AddMarketScanElement from '../../../../components/Modal/MarketScanElement/AddMarketScanElement';

const MarketDetails: FunctionComponent = () => {
  const { id: conceptId = '' } = useParams();
  const { data: marketScan } = useConceptMarketScan(conceptId || '');
  const { trendsAndDriversDescription, ecosystemDescription } = useEditMarketScan();
  const { mutate: addTrendAndDriver } = useTrendAndDriverCreate(conceptId || '');
  const { openModal } = useModal();

  return (
    <div className={styles.marketDetails}>
      <div className={styles.summary}>
        <div className={styles.detailBlock}>
          <div className={styles.detailTitle}>
            <h2>Trends and Drivers</h2>
            <button
              className='btn btn-light'
              onClick={() => {
                openModal(AddMarketScanElement, { addItem: addTrendAndDriver });
              }}
            >
              <Icon variant='plus' />
            </button>
          </div>
          <EditModeSwitcher
            containerClassName={styles.textBlock}
            value={trendsAndDriversDescription.value}
            label=''
            name='trendsAndDriversDescription'
            maxLength={trendsAndDriversDescription.validation.maxLength}
            onChange={trendsAndDriversDescription.handleChange}
            handleSave={trendsAndDriversDescription.handleSave}
            handleCancel={trendsAndDriversDescription.handleCancel}
          />
        </div>
      </div>
      <div className={styles.cardContainer}>
        {marketScan?.trendsAndDrivers.map((trend) => <TrendAndDriverCard trendAndDriver={trend} key={trend.uuid} />)}
      </div>
      <div className={styles.summary}>
        <div className={styles.detailBlock}>
          <h2>Ecosystem</h2>
          <EditModeSwitcher
            containerClassName={styles.textBlock}
            value={ecosystemDescription.value}
            label=''
            name='ecosystemDescription'
            maxLength={ecosystemDescription.validation.maxLength}
            onChange={ecosystemDescription.handleChange}
            handleSave={ecosystemDescription.handleSave}
            handleCancel={ecosystemDescription.handleCancel}
          />
        </div>
      </div>
      <div className={styles.cardContainer}>
        <EcosystemList title='Top Startups' data={marketScan?.startups || []} ecosystemType='startup' />
        <EcosystemList title='Top Incumbents' data={marketScan?.incumbents || []} ecosystemType='incumbents' />
        <EcosystemList title='Top Investors' data={marketScan?.investors || []} ecosystemType='investors' />
      </div>

      {/* This external link is required to be added to the page when using Clearbit logos */}
      <div className={styles.externalLogoLink}>
        <a href='https://clearbit.com' target='_blank' rel='noopener noreferrer'>
          Logos provided by Clearbit
        </a>
      </div>
    </div>
  );
};

export default MarketDetails;
