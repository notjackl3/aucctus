import { FunctionComponent } from "react";
import TargetIcon from '../assets/icons/target.svg?react';
import styles from "../assets/styles/components/company-metric.module.scss";
import Loading from "./Loading";


interface CompanyMetricProps {
  title: string;
  isLoading?: boolean;
  value?: string | number
}

const CompanyMetric: FunctionComponent<CompanyMetricProps> = ({ title, value, isLoading = false }) => {
  return (
    <div className={styles.companyMetric}>
      <div className={styles.heading}>
        <TargetIcon width={25} height={24} stroke="#2B3674" />
        <span className={styles.title} >{isLoading ? <Loading /> : title}</span>
      </div>
      <div>
        {value ? <span className={styles.value}>{value}</span> : null}
      </div>
    </div>
  );
};

export default CompanyMetric;
