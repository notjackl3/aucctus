import { FunctionComponent } from "react";
import MetricItem from "./MetricItem";
import styles from "./InnovationGoalContainer.module.css";

const InnovationGoalContainer: FunctionComponent = () => {
  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <div className={styles.textAndSupportingText}>
          <b className={styles.text}>Innovation Goal</b>
          <div className={styles.supportingText}>
            Empowering the future of communication and commerce by bridging
            Canadian communities with pioneering solutions, elevating every
            experience through sustainable, tech-driven, and health-centric
            innovations. We envision a Canada where every individual,
            irrespective of their location, has timely and intuitive access to
            essential services that enrich lives, foster growth, and cultivate
            possibilities.
          </div>
        </div>
      </div>
      <div className={styles.metricItemParent}>
        <MetricItem
          icon="/assets/icons/currencydollar.svg"
          value="23"
          trend="32%"
          currencyDollarIcon={false}
          trendUpIcon={false}
          showRocketIcon
          showArrowUpIcon
        />
        <MetricItem
          icon="/assets/icons/currencydollar.svg"
          value="5.48%"
          trend="32%"
          currencyDollarIcon
          trendUpIcon={false}
          showRocketIcon={false}
          showArrowUpIcon
        />
        <MetricItem
          icon="/assets/icons/currencydollar.svg"
          value="$4.7M"
          trend="32%"
          currencyDollarIcon={false}
          trendUpIcon
          showRocketIcon={false}
          showArrowUpIcon
        />
        <MetricItem
          icon="/assets/icons/currencydollar.svg"
          value="10M"
          trend="on track"
          currencyDollarIcon
          trendUpIcon={false}
          showRocketIcon={false}
          showArrowUpIcon={false}
        />
      </div>
    </div>
  );
};

export default InnovationGoalContainer;
