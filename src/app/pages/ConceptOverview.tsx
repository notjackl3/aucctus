import { FunctionComponent, useState } from 'react';
import styles from '../assets/styles/pages/concept-overview.module.scss';
import images from '../assets/img';
import ConceptCard from '../components/ConceptCard';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../libs/api';
import { IConceptOverview, IConceptResponse } from '../../libs/api/typings/ignite-concepts';
import Loading from '../components/Loading';
import { AppPath } from '../../routes/routes';

const ConceptOverview: FunctionComponent = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<IConceptOverview | undefined>(undefined);
  const [concept, setConcept] = useState<IConceptResponse | undefined>(undefined);

  const conceptQuery = useQuery({
    queryKey: [`concept/:id`, id],
    retry: 2,
    queryFn: async () => await api.igniteConcept.getGeneratedConcept(id || ''),
    onSuccess: (response) => {
      setConcept(response);
    },
  });

  const overviewQuery = useQuery({
    queryKey: `concept/overview/${id}`,
    retry: 2,
    queryFn: async () => await api.igniteConcept.getConceptOverview(id || ''),
    onSuccess: (response) => {
      setData(response);
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <img alt="Concept Overview" src={images.conceptOverview} />
        <div className={styles.content}>
          <h1 className={styles.header}>{concept?.title}</h1>
          <div className={styles.contentContainer}>
            <div className={styles.conceptOverview}>
              <div className={styles.supportingText}>
                <span className={styles.title}>Overview</span>
                {conceptQuery.isLoading ? <Loading /> : <span>{concept?.summary}</span>}
              </div>

              <div className={styles.supportingText}>
                <span className={styles.title}>Value Proposition</span>
                {overviewQuery.isLoading ? <Loading /> : <span className={styles.text}>{data?.valueProposition}</span>}
              </div>
            </div>
            <div className={styles.details}>
              <div className={styles.detailContent}>
                <div className={styles.supportingText}>
                  <span className={styles.title}>Annual Revenue</span>
                  {overviewQuery.isLoading ? (
                    <Loading />
                  ) : (
                    <span className={styles.text} data-text={data?.annualRevenue}>
                      {data?.annualRevenue || 0}
                    </span>
                  )}
                </div>
                <div className={styles.supportingText}>
                  <span className={styles.title}>Total Addressable Market</span>
                  {overviewQuery.isLoading ? (
                    <Loading />
                  ) : (
                    <span className={styles.text} data-text={data?.totalAddressableMarket}>
                      {data?.totalAddressableMarket || 0}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.detailContent}>
                <div className={styles.supportingText}>
                  <span className={styles.title}>Signals</span>
                  {overviewQuery.isLoading ? (
                    <Loading />
                  ) : (
                    data?.signals?.slice(0, 3).map((s, i) => (
                      <span className={styles.text} data-text={s} key={`signal-${i}`}>
                        {s}
                      </span>
                    ))
                  )}
                </div>
                <div className={styles.supportingText}>
                  <span className={styles.title}>Industries</span>
                  {overviewQuery.isLoading ? (
                    <Loading />
                  ) : (
                    data?.industries?.slice(0, 3).map((s, i) => (
                      <span className={styles.text} data-text={s} key={`industries-${i}`}>
                        {s}
                      </span>
                    ))
                  )}
                </div>
                <div className={styles.supportingText}>
                  <span className={styles.title}>Target User Groups</span>
                  {overviewQuery.isLoading ? (
                    <Loading />
                  ) : (
                    data?.targetGroups?.slice(0, 3).map((s, i) => (
                      <span className={styles.text} data-text={s} key={`target-user-group-${i}`}>
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentContainer}>
        <ConceptCard
          title="Concept Score"
          subtitle="This concept is in the top percentile."
          width={360}
          buttonTitle="Coming Soon"
          actionButtonProps={{
            disabled: true,
            'aria-disabled': true,
          }}
        >
          <div className={styles.cardContentWrapper}>
            <div style={{ height: 232 }}>
              <CircularProgressbar
                value={concept?.score || 0}
                circleRatio={0.5}
                className={styles.progressbar}
                text={`${concept?.score || 0}`}
                styles={buildStyles({
                  rotation: 0.75,
                  strokeLinecap: 'round',
                  pathColor: '#4318ff',
                  trailColor: '#E0E5F2',
                  textColor: '#2B3674',
                })}
              />
            </div>
            <div className={styles.cardContent}>
              <span className={styles.title}>Let's make it even stronger</span>
              <span className={styles.text}>
                We have identified 5 different areas that you can explore to make this concept even stronger
              </span>
            </div>
          </div>
        </ConceptCard>

        <ConceptCard
          title="Financial Projection"
          subtitle="Breakdown of business model canvas and hypotheses to validate."
          width={360}
          buttonTitle="Coming Soon"
          actionButtonProps={{
            disabled: true,
            'aria-disabled': true,
          }}
        >
          <img alt="Financial Projection" src={images.financialProjection} />
        </ConceptCard>

        <ConceptCard
          title="Customer Profiles"
          subtitle="Breakdown of target user pain points and jobs to be done."
          width={360}
          buttonTitle="View Details"
          icon="userGroup"
          actionButtonProps={{
            disabled: !id,
            onClick: () => {
              if (!id) return;
              navigate(AppPath.ConceptCustomerPersona.replace(':id', id));
            },
          }}
        >
          <div className={styles.cardContentWrapper}>
            <img alt="Customer Profile" src={images.customerProfile} />

            <div className={styles.cardContent}>
              <span className={styles.title}>Mostly Millennial and Hip profiles</span>
              <span className={styles.text}>
                The MVP has been targeted towards the millennials that spends the most time abroad
              </span>
            </div>
          </div>
        </ConceptCard>
      </div>
    </div>
  );
};

export default ConceptOverview;
