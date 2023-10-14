import { FunctionComponent } from "react";
import IconButton from "./IconButton";
import styles from "./PageHeader.module.css";

const PageHeader: FunctionComponent = () => {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.imageWrap}>
        <img
          className={styles.imageIcon}
          alt=""
          src="/assets/icons/image1.svg"
        />
      </div>
      <div className={styles.container}>
        <div className={styles.avatar}>
          <img
            className={styles.image8Icon}
            alt=""
            src="/assets/icons/image-8@2x.png"
          />
          <img
            className={styles.image9Icon}
            alt=""
            src="/assets/icons/image-9@2x.png"
          />
        </div>
        <div className={styles.textAndSupportingText}>
          <div className={styles.text}>Canada Post</div>
          <div className={styles.supportingText}>
            Crown corporation that functions as the primary postal operator in
            Canada
          </div>
        </div>
        <div className={styles.actions}>
          <IconButton icon="/assets/icons/star011.svg" />
          <div className={styles.button}>
            <img
              className={styles.placeholderIcon}
              alt=""
              src="/assets/icons/placeholder17.svg"
            />
            <div className={styles.text1}>Action</div>
            <img
              className={styles.placeholderIcon}
              alt=""
              src="/assets/icons/placeholder17.svg"
            />
          </div>
          <div className={styles.button1}>
            <img
              className={styles.placeholderIcon}
              alt=""
              src="/assets/icons/placeholder8.svg"
            />
            <div className={styles.text1}>Action</div>
            <img
              className={styles.placeholderIcon}
              alt=""
              src="/assets/icons/placeholder8.svg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
