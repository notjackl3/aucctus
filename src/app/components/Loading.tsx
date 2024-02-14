import { FunctionComponent } from 'react';

import styles from '../assets/styles/components/loading.module.scss';

const Loading: FunctionComponent = () => {
  return (
    <span className={styles.bouncingDots}>
      <span className={styles.dot}>.</span>
      <span className={styles.dot}>.</span>
      <span className={styles.dot}>.</span>
    </span>
  );
};

export default Loading;
