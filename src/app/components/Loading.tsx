import { FunctionComponent } from 'react';

import styles from '../assets/styles/components/loading.module.scss';
import { cn } from '@libs/utils/react';

interface LoadingProps {
  isSmall?: boolean;
  className?: string;
}
const Loading: FunctionComponent<LoadingProps> = ({ isSmall, className }) => {
  const smallDotsClassName = isSmall ? styles.small : '';

  return (
    <span
      className={cn(`${styles.bouncingDots} ${smallDotsClassName}`, className)}
    >
      <span className={styles.dot}>.</span>
      <span className={styles.dot}>.</span>
      <span className={styles.dot}>.</span>
    </span>
  );
};

export default Loading;
