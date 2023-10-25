import { FunctionComponent } from "react";
import styles from "../assets/styles/pages/auth-screens.module.scss";
import StarIcon from "../assets/icons/Star";
import images from "../assets/img";
import fictionalLogo from "../assets/icons/fictional-company-logo.svg";

const NUMBER_OF_STARS = 5;

const IntoSection: FunctionComponent = () => {
  return (
    <div className={styles.intoSection}>
      <div className={styles.quoteAndAttribution}>
        <div className={styles.stars}>
          { // Create the Stars icon N times
            [...Array(NUMBER_OF_STARS)].map((e, i) =>
              <StarIcon key={`star-icon-${i}`} height={20} width={30} stroke="#2B3674" fill="#2B3674" />
            )}
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

          <img
            alt="Logo"
            style={{ fill: "#2B3674", width: 140, height: 33 }}
            src={fictionalLogo}
          />
        </div>
      </div>
      <div className={styles.screenMockupWrapper}>
        <div className={styles.screenMockup}>
          <div className={styles.mockupShadow} />
          <img
            className={styles.screenMockupReplaceFill}
            alt="Aucctus"
            src={images.screenMockup}
          />
        </div>
      </div>
    </div>
  );
};

export default IntoSection;
