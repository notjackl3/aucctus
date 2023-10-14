import { FunctionComponent } from "react";
import styles from "../../assets/styles/pages/auth-screens.module.scss";
import StarIcon from "../../assets/icons/Star";
import images from "../../assets/img";
import FictionalLogo from "../../assets/icons/FictionalCompanyLogo";

interface IntoSectionProps {
  shadow?: boolean;
};

const IntoSection: FunctionComponent<IntoSectionProps> = ({ shadow }) => {
  return (
    <div className={styles.intoSection}>
      <div className={styles.quoteAndAttribution}>
        <div className={styles.stars}>
          <StarIcon />
          <StarIcon />
          <StarIcon />
          <StarIcon />
          <StarIcon />
        </div>
        <div className={styles.quote}>
          Few things make me feel more powerful than setting up automation in
          Aucctus to make my life easier and more efficient.
        </div>
        <div className={styles.textAndStars}>
          <div className={styles.textAndSupportingText}>
            <div className={styles.text}>— Aliah Lane</div>
            <div className={styles.supportingText}>Founder, Acme Corp</div>
          </div>
          <FictionalLogo />
        </div>
      </div>
      <div className={styles.screenMockupWrapper}>
        <div className={styles.screenMockup}>
          <div className={styles.mockupShadow} />
          <img
            className={styles.screenMockupReplaceFill}
            alt=""
            src={images.screenMockup}
          />
        </div>
      </div>
    </div>
  );
};

export default IntoSection;
