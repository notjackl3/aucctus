import { FunctionComponent } from 'react';

import styles from '../assets/styles/components/challenge-starter.module.scss';
import IgniteIcon from '../assets/icons/ignite.svg?react';
import Icon from './Icon';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../routes/routes';

interface IChallengeStarterProps {}

const ChallengeStarter: FunctionComponent<IChallengeStarterProps> = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.challengeStarter}>
      <div className={styles.header}>
        <IgniteIcon width={172} height={128} />
        <div className={styles.supportingText}>
          <h1>Start Your first Challenge</h1>
          <span>You are only a couple of minutes away from company-wide innovation</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className="btn btn-primary"
          onClick={() => {
            navigate(AppPath.ChallengeWizard);
          }}
        >
          <Icon variant="rocket" />
          Start A Challenge
        </button>
      </div>
    </div>
  );
};

export default ChallengeStarter;
