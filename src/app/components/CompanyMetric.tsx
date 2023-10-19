import { FunctionComponent } from "react";
import TargetIcon from '../assets/icons/target.svg?react';
import styles from "../assets/styles/components/company-metric.module.scss";


interface CompanyMetricProps {
  title: string;
  value: string
}

const CompanyMetric: FunctionComponent<CompanyMetricProps> = ({ title, value }) => {
  return (
    <div className={styles.companyMetric}>
      <TargetIcon width={"25"} height={"24"} stroke="#2B3674" />
      <span className={styles.title} >{title}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
};

export default CompanyMetric;
