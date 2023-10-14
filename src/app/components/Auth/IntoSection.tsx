import { FunctionComponent } from "react";

import screenImage from '../../assets/img/screen-mockup-replace-fill.png';
import styles from "../../assets/styles/pages/auth-screens.module.scss";
import StarIcon from "../../assets/icons/Star";

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
          Auctus to make my life easier and more efficient.
        </div>
        <div className={styles.textAndStars}>
          <div className={styles.textAndSupportingText}>
            <div className={styles.text}>— Aliah Lane</div>
            <div className={styles.supportingText}>Founder, Acme Corp</div>
          </div>
          <img
            className={styles.fictionalCompanyLogo}
            alt=""
            src="/assets/icons/fictional-company-logo.svg"
          />
        </div>
      </div>
      <div className={styles.screenMockupWrapper}>
        <div className={styles.screenMockup}>
          <div className={styles.mockupShadow} />
          <img
            className={styles.screenMockupReplaceFill}
            alt=""
            src={new URL(screenImage, import.meta.url).href}
          />
        </div>
      </div>
    </div>
  );
};

export default IntoSection;
