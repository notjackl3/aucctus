import { FunctionComponent } from 'react';
import styles from './conceptSnapshot.module.scss';
import igniteIcon from '../../assets/ignite.svg';
import Icon from '../../components/Icons/Icon/Icon';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';

const defaultIconProps = {
  height: 24,
  width: 24,
  stroke: '#2B3674',
};

const ConceptSnapshot: FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.conceptSnapshot}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img alt="Ignite!" style={{ width: 172, height: 128 }} src={igniteIcon} />
          <div className={styles.supportingText}>
            <h1 className={styles.title}>Opportunity Snapshot downloaded</h1>
          </div>
        </div>
        <button className={`btn btn-bold btn-no-border`} onClick={() => navigate(AppPath.Concept)}>
          <Icon variant="chevronleft" {...defaultIconProps} />
          <span>Back to Concepts</span>
        </button>
      </div>
    </div>
  );
};

export default ConceptSnapshot;
