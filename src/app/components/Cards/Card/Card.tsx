import { FunctionComponent, ReactNode } from 'react';

import styles from '../assets/styles/components/card.module.scss';

interface CardProps {
  children: ReactNode;
}

const Card: FunctionComponent<CardProps> = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};

export default Card;
