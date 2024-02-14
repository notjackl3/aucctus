import { FunctionComponent } from 'react';

import IgniteIcon from '../assets/icons/ignite.svg?react';

import styles from '../assets/styles/components/challenge-success.module.scss';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../routes/routes';
import Icon from './Icon';

interface IChallengeSuccessProps {
  challengeId: string;
}

const ChallengeSuccess: FunctionComponent<IChallengeSuccessProps> = ({ challengeId }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.challengeSuccess}>
      <div className={styles.header}>
        <IgniteIcon width={172} height={128} />
        <div className={styles.supportingText}>
          <h1>Success!</h1>
          <span>Your challenge has been deployed</span>
        </div>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => {
          navigate(AppPath.ChallengeDetails.replace(':id', challengeId));
        }}
      >
        <Icon variant="columns" />
        Go to Tracker
      </button>
    </div>
  );
};

export default ChallengeSuccess;
