import { FunctionComponent } from "react";
import styles from "./IntoSection.module.css";

type IntoSectionType = {
  shadow?: boolean;
};

const IntoSection: FunctionComponent<IntoSectionType> = ({ shadow }) => {
  return (
    <div className={styles.intoSection}>
      <div className={styles.quoteAndAttribution}>
        <div className={styles.stars}>
          <img
            className={styles.starIcon}
            alt=""
            src="/assets/icons/fill100-colorgray.svg"
          />
          <img
            className={styles.starIcon}
            alt=""
            src="/assets/icons/fill100-colorgray.svg"
          />
          <img
            className={styles.starIcon}
            alt=""
            src="/assets/icons/fill100-colorgray.svg"
          />
          <img
            className={styles.starIcon}
            alt=""
            src="/assets/icons/fill100-colorgray.svg"
          />
          <img
            className={styles.starIcon}
            alt=""
            src="/assets/icons/fill100-colorgray.svg"
          />
        </div>
        <div className={styles.quote}>
          Few things make me feel more powerful than setting up automations in
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
            src="/assets/icons/screen-mockup-replace-fill1@2x.png"
          />
        </div>
      </div>
    </div>
  );
};

export default IntoSection;
