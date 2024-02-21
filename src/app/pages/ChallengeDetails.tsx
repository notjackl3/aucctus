import { FunctionComponent, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IChallengeResponse } from '../../libs/api/typings/challenges';
import { useQuery } from 'react-query';
import api from '../../libs/api';

import styles from '../assets/styles/pages/challenge-details.module.scss';
import CompanyMetric from '../components/CompanyMetric';
import Icon from '../components/Icon';
import Loading from '../components/Loading';

const ChallengeDetails: FunctionComponent = () => {
  let { id } = useParams();
  const [challenge, setChallenge] = useState<IChallengeResponse>();
  const [endDate, setEndDate] = useState<string>('');

  const query = useQuery({
    queryKey: [`concept/:id`, id],
    retry: 2,
    // queryFn: async () => await api.challenge.getChallenge(id || ''),
    // onSuccess: (response) => {
    //   setChallenge(response);
    //   if (response.endDate) setEndDate(new Date(response.endDate).toLocaleDateString('en-US'));
    // },
    onError: (error) => {
      alert(error);
    },
  });

  return (
    <div className={styles.challengeDetails}>
      <div className={styles.header}>
        <h1>{query.isLoading ? <Loading /> : challenge?.title}</h1>
        <div className={styles.actions}>
          <button className="btn btn-primary" disabled>
            <Icon variant="lightbulb" />
            Submit Idea
          </button>
          <button className="btn btn-primary" disabled>
            <Icon variant="announcement" />
            Close Submission
          </button>
        </div>
      </div>

      <section className={styles.details}>
        <div className={styles.overview}>
          <div className={styles.info}>
            <h2>Overview</h2>
            <span>{challenge?.description || ''}</span>
          </div>

          <div className={styles.info}>
            <h2>Pain Point</h2>
            <span>{challenge?.pains || ''}</span>
          </div>
        </div>

        <div className={styles.metrics}>
          <CompanyMetric icon="lightbulb" title="Ideas Submitted" value={0} isLoading={query.isLoading} />
          <CompanyMetric icon="calendar" title="Submission End Date" value={endDate} isLoading={query.isLoading} />
          <CompanyMetric icon="userGroup" title="Employees Engaged" value={0} isLoading={query.isLoading} />
        </div>
      </section>
    </div>
  );
};

export default ChallengeDetails;
