import { FunctionComponent } from 'react';
import images from '../../assets/img';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import Icon from '../Icon/Icon/Icon';

const NUMBER_OF_STARS = 5;

const IntoSection: FunctionComponent = () => {
  return (
    <div className={styles.intoSection}>
      <div className={styles.quoteAndAttribution}>
        <div className={styles.stars}>
          {
            // Create the Stars icon N times
            [...Array(NUMBER_OF_STARS)].map((e, i) => (
              <Icon
                variant='star-01'
                key={`star-icon-${i}`}
                height={20}
                width={30}
                stroke='#2B3674'
                fill='#2B3674'
              />
            ))
          }
        </div>
        <div className={styles.quote}>
          Aucctus provides enormous potential for organizations to innovate at
          speed and scale.
        </div>
        <div className={styles.textAndStars}>
          <div className={styles.textAndSupportingText}>
            <div className={styles.text}>— Brandon Milner</div>
            <div className={styles.supportingText}>
              Head of Innovation at EllisDon
            </div>
          </div>
        </div>
      </div>
      <div className={styles.screenMockupWrapper}>
        {/* <div className={styles.screenMockup}> */}

        <img
          className={styles.screenMockup}
          alt='Aucctus'
          src={images.screenMockup}
        />
        {/* </div> */}
      </div>
    </div>
  );
};

export default IntoSection;
