import { FunctionComponent } from "react";
import IconBubble from "./IconBubble";
import SizemdIconIconLeadingCo from "./SizemdIconIconLeadingCo";
import styles from "./MetricItem.module.css";

type MetricItemType = {
  icon?: string;
  value?: string;
  trend?: string;
  currencyDollarIcon?: boolean;
  trendUpIcon?: boolean;
  showRocketIcon?: boolean;
  showArrowUpIcon?: boolean;
};

const MetricItem: FunctionComponent<MetricItemType> = ({
  icon,
  value,
  trend,
  currencyDollarIcon,
  trendUpIcon,
  showRocketIcon,
  showArrowUpIcon,
}) => {
  return (
    <div className={styles.metricItem}>
      <IconBubble icon="/assets/icons/currencydollar4.svg" />
      <div className={styles.headingParent}>
        <div className={styles.heading}>Products Launched</div>
        <div className={styles.numberParent}>
          <div className={styles.number}>{value}</div>
          <SizemdIconIconLeadingCo
            label="32%"
            showArrowUpIcon
            arrowUpIconWidth="12px"
            arrowUpIconHeight="12px"
            textLineHeight="20px"
          />
        </div>
      </div>
    </div>
  );
};

export default MetricItem;
