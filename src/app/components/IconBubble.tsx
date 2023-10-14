import { FunctionComponent } from "react";
import styles from "./IconBubble.module.css";

type IconBubbleType = {
  icon?: string;
};

const IconBubble: FunctionComponent<IconBubbleType> = ({ icon }) => {
  return (
    <div className={styles.iconBubble}>
      <div className={styles.green}>
        <img className={styles.currencyDollarIcon} alt="" src={icon} />
        <img
          className={styles.currencyDollarIcon}
          alt=""
          src="/assets/icons/checkcircle2.svg"
        />
        <img className={styles.keyIcon} alt="" src="/assets/icons/key2.svg" />
        <img className={styles.mailIcon} alt="" src="/assets/icons/mail2.svg" />
        <img className={styles.starIcon} alt="" src="/assets/icons/star2.svg" />
        <img
          className={styles.starIcon}
          alt=""
          src="/assets/icons/trendup2.svg"
        />
        <img className={styles.starIcon} alt="" src="/assets/icons/send2.svg" />
        <img
          className={styles.starIcon}
          alt=""
          src="/assets/icons/lightbulb2.svg"
        />
        <img
          className={styles.starIcon}
          alt=""
          src="/assets/icons/filecode2.svg"
        />
        <img
          className={styles.starIcon}
          alt=""
          src="/assets/icons/rocket2.svg"
        />
      </div>
      <div className={styles.purple}>
        <img className={styles.keyIcon1} alt="" src="/assets/icons/key1.svg" />
        <img
          className={styles.currencyDollarIcon1}
          alt=""
          src="/assets/icons/currencydollar3.svg"
        />
        <img
          className={styles.mailIcon1}
          alt=""
          src="/assets/icons/mail3.svg"
        />
        <img
          className={styles.starIcon1}
          alt=""
          src="/assets/icons/star1.svg"
        />
        <img
          className={styles.checkCircleIcon1}
          alt=""
          src="/assets/icons/checkcircle3.svg"
        />
        <img
          className={styles.starIcon1}
          alt=""
          src="/assets/icons/trendup1.svg"
        />
        <img
          className={styles.starIcon1}
          alt=""
          src="/assets/icons/send3.svg"
        />
        <img
          className={styles.starIcon1}
          alt=""
          src="/assets/icons/lightbulb1.svg"
        />
        <img
          className={styles.starIcon1}
          alt=""
          src="/assets/icons/filecode1.svg"
        />
        <img
          className={styles.starIcon}
          alt=""
          src="/assets/icons/rocket1.svg"
        />
      </div>
    </div>
  );
};

export default IconBubble;
