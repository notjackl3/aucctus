import { FunctionComponent } from "react";
import styles from "../assets/styles/pages/ignite.module.scss";
import IgniteIcon from '../assets/icons/ignite.svg?react';
import Loading from "./Loading";



interface IgniteLoadingProps {
  title: string;
  subtitle: string;
}

const IgniteLoading: FunctionComponent<IgniteLoadingProps> = ({ title, subtitle, }) => {

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IgniteIcon width={172} height={128} />
        <div className={styles.supportingText}>
          <h1 className={styles.title}>{title}</h1>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
      </div>
      <div className={styles.content}>
        <Loading />
      </div>
    </div >
  );
};

export default IgniteLoading;
