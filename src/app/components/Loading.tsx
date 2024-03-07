import { FunctionComponent } from 'react';

import styles from '../assets/styles/components/loading.module.scss';

interface LoadingProps {
  isSmall?: boolean;
}
const Loading: FunctionComponent<LoadingProps> = ({ isSmall }) => {
  const smallDotsClassName = isSmall ? styles.small : '';

  return (
    <span className={`${styles.bouncingDots} ${smallDotsClassName}`}>
      <span className={styles.dot}>.</span>
      <span className={styles.dot}>.</span>
      <span className={styles.dot}>.</span>
    </span>
  );
};

export default Loading;
