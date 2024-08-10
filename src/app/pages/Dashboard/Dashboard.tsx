import { Card, Icon } from '@components';
import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import ConceptBarChart from '../../components/Charts/ConceptBarChart';
import { useDashboard } from '../../hooks/query/account.hook';
import { useAppStore } from '../../stores/app.store';
import DashboardInnovationCard from './components/DashboardInnovationCard';
import DashboardOpportunityCard from './components/DashboardOpportunityCard';
import styles from './styles/dashboard.module.scss';

const defaultIconProps = {
  stroke: '#2B3674',
  width: 20,
  height: 20,
};

const Dashboard: FunctionComponent = () => {
  const navigate = useNavigate();
  const { account } = useAppStore();
  const { data } = useDashboard();

  return (
    <div className={`${styles.dashboard}`}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <h1>{account?.name || ''}</h1>
        </div>
        <div className={styles.actions}>
          <button
            className={`btn btn-primary ${styles.button}`}
            onClick={() => {
              navigate(AppPath.IgniteConcept);
            }}
          >
            <Icon variant='rocket' height={20} width={20} stroke='#fff' />
            Add Concept
          </button>
        </div>
      </div>
      <div className={styles.contentContainer}>
        {data?.conceptDetails.count && (
          <div className={`${styles.cardContainer} ${styles.innovationCard}`}>
            <DashboardInnovationCard conceptCount={data.conceptDetails.count} />
          </div>
        )}
        <div className={`${styles.cardContainer} ${styles.barChart}`}>
          <Card.Detail
            title='Active Concepts'
            cardClassName={styles.cardStyle}
            footerAction={
              <button
                className='btn btn-secondary'
                onClick={() => {
                  navigate(AppPath.ConceptCategory);
                }}
                aria-label='View Concept Bank'
              >
                Go to Concept Bank <Icon variant='arrowright' {...defaultIconProps} />
              </button>
            }
          >
            <div className={styles.cardContent}>
              <ConceptBarChart data={data?.conceptDetails.count} />
            </div>
          </Card.Detail>
        </div>
        {data?.conceptDetails && (
          <div className={`${styles.cardContainer}`}>
            <DashboardOpportunityCard conceptDetails={data.conceptDetails} />
          </div>
        )}
        {/* TODO - Add Market Activity Card */}
        {/* <div className={`${styles.cardContainer} ${styles.marketCard}`}>
          <MarketActivityCard />
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
