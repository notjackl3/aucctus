import { FunctionComponent } from "react";
import styles from "../assets/styles/components/footer.module.scss";
import MailIcon from "../assets/icons/Mail";

const year = new Date().getFullYear()

const Footer: FunctionComponent = () => {

  return (
    <div className={styles.footer}>
      <div className={styles.text}>
        © {year} Disruptive Edge. All Rights Reserved.
      </div>
      {/* TODO: Add Mail Link */}
      <div className={styles.row}>
        <MailIcon />
        <div className={styles.text}>help@auctus.com</div>
      </div>
    </div>
  );
};

export default Footer;
