import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAccount } from '../../../features/auth/auth.slice';

import styles from './styles/dashboard.module.scss';
import Icon from '../../components/Icon';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import ConceptDetailCard from '../../components/ConceptDetailCard/ConceptDetailCard';
import ConceptStatistic from '../../components/ConceptStatistic';
import ConceptBarChart from '../../components/ConceptBarChart';
import { useQuery } from 'react-query';
import api from '../../../libs/api';
import { ConceptCategory, ConceptStatus } from '../../../libs/api/typings';
import { BarData } from '../../components/ConceptBarChart/ConceptBarChart';
import { getConceptStatusBarColor } from '../../../libs/concepts';
import { camelCaseToSnakeCase } from '../../../libs/utils';
import { getConceptStagePercent, getConceptTotalPercents } from './utils';

const defaultIconProps = {
  stroke: '#2B3674',
  width: 20,
  height: 20,
};
const Dashboard: FunctionComponent = () => {
  const navigate = useNavigate();
  const { name: accountName } = useSelector(selectAccount) || { name: '' };

  const { data } = useQuery({
    // TEMP API call for concept data
    queryKey: ['concepts'],
    refetchOnWindowFocus: false,
    retry: 0,
    queryFn: async () => {
      return api.concept.getConcepts({
        category: ConceptCategory.active,
      });
    },
  });

  const barData = useMemo(() => {
    // TEMP function until updated with new concept data endpoint
    if (!data || !data.statusCounts) {
      return [];
    }
    const activeStatuses = ['commercialized', 'minimumViableProduct', 'proofOfConcept', 'prototyping'];
    return Object.entries(data?.statusCounts)
      .map(([status, statusCount]) => {
        if (activeStatuses.includes(status)) {
          return {
            label: status,
            value: statusCount,
            color: getConceptStatusBarColor(camelCaseToSnakeCase(status) as ConceptStatus),
          };
        }
      })
      .filter(Boolean) as BarData[];
  }, [data]);

  const conceptStagePercents = useMemo(() => {
    if (!data || !data.statusCounts) {
      return [];
    }
    return getConceptStagePercent(data.statusCounts);
  }, [data]);

  const conceptStageTotalPercents = useMemo(() => {
    if (!data || !data.statusCounts) {
      return [];
    }
    return getConceptTotalPercents(data.statusCounts, data.count);
  }, [data]);

  return (
    <div className={`${styles.dashboard}`}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <h1>{accountName}</h1>
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
        <div className={styles.cardContainer}>
          <ConceptDetailCard title="Innovation Scorecard" cardClassName={styles.cardStyle} isHideFooter>
            <div className={styles.cardContent}>
              <div className={styles.cardRow}>
                {/* TODO - remove temp data and duplication when API is updated */}
                <ConceptStatistic
                  infoTitle="Concepts Generated"
                  infoValue="30"
                  icon="lightbulb"
                  iconColor="lightblue"
                />
              </div>
              <div className={styles.cardRow}>
                <ConceptStatistic infoTitle="POCs Launched" infoValue="10" icon="paperAirPlane" iconColor="blue" />
              </div>
              <div className={styles.cardRow}>
                <ConceptStatistic infoTitle="MVPs Launched" infoValue="3" icon="rocket" iconColor="blue" />
              </div>
              <div className={styles.cardRow}>
                <ConceptStatistic
                  infoTitle="Products Commercialized"
                  infoValue="1"
                  icon="shieldDollar"
                  iconColor="purple"
                />
              </div>
            </div>
          </ConceptDetailCard>
        </div>
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
                <span>Go to Concept Bank {<Icon variant="arrowRight" {...defaultIconProps} />}</span>
              </button>
            }
          >
            <div className={styles.cardContent}>
              <ConceptBarChart
                barData={barData}
                shortArrowPercents={conceptStagePercents}
                longArrowPercents={conceptStageTotalPercents}
              />
            </div>
          </ConceptDetailCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
