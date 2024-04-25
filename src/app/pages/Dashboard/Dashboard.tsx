import { FunctionComponent } from 'react';
import styles from './styles/dashboard.module.scss';
import Icon from '../../components/Icons/Icon/Icon';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import ConceptDetailCard from '../../components/Cards/ConceptDetailCard/ConceptDetailCard';
import ConceptBarChart from '../../components/Charts/ConceptBarChart';
import DashboardOpportunityCard from './components/DashboardOpportunityCard';
import DashboardInnovationCard from './components/DashboardInnovationCard';
import { useDashboard, useUserDetails } from '../../hooks/query/account.hook';

const defaultIconProps = {
  stroke: '#2B3674',
  width: 20,
  height: 20,
};

const Dashboard: FunctionComponent = () => {
  const navigate = useNavigate();
  const { account } = useUserDetails();
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
            <Icon variant="rocket" height={20} width={20} stroke="#fff" />
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
          <ConceptDetailCard
            title="Active Concepts"
            cardClassName={styles.cardStyle}
            footerAction={
              <button
                className={styles.cardAction}
                onClick={() => {
                  navigate(AppPath.ConceptCategory);
                }}
                aria-label="View Concept Bank"
              >
                <span>Go to Concept Bank {<Icon variant="arrowright" {...defaultIconProps} />}</span>
              </button>
            }
          >
            <div className={styles.cardContent}>
              <ConceptBarChart data={data?.conceptDetails.count} />
            </div>
          </ConceptDetailCard>
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
