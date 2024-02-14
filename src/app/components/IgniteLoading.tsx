import { FunctionComponent } from 'react';
import styles from '../assets/styles/pages/ignite.module.scss';
import igniteIcon from '../assets/icons/ignite.svg';
import Loading from './Loading';

interface IgniteLoadingProps {
  title: string;
  subtitle: string;
}

const IgniteLoading: FunctionComponent<IgniteLoadingProps> = ({ title, subtitle }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img alt="Ignite!" style={{ width: 172, height: 128 }} src={igniteIcon} />
        <div className={styles.supportingText}>
          <h1 className={styles.title}>{title}</h1>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
      </div>
      <div className={styles.content}>
        <Loading />
      </div>
    </div>
  );
};

export default IgniteLoading;
