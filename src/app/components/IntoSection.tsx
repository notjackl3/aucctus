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
          We've been on the lookout for a cutting-edge solution to elevate our digital strategies, and Aucctus promises to be exactly what we've been searching for. Leveraging AI for business innovation is the future, and we're excited to embark on this journey. Can't wait to integrate it into our processes
        </div>
        <div className={styles.textAndStars}>
          <div className={styles.textAndSupportingText}>
            <div className={styles.text}>— Brandon Milner, Ellis Don</div>
            {/* <div className={styles.supportingText}>Founder, Acme Corp</div> */}
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
