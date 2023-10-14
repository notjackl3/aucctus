import { FunctionComponent } from "react";
import styles from "./Footer.module.css";

const Footer: FunctionComponent = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.text}>
        © 2023 Disruptive Edge. All Rights Reserved.
      </div>
      <div className={styles.row}>
        <img
          className={styles.mail01Icon}
          alt=""
          src="/assets/icons/mail01.svg"
        />
        <div className={styles.text}>help@auctus.com</div>
      </div>
    </div>
  );
};

export default Footer;
