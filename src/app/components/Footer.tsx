import { FunctionComponent } from "react";
import styles from "../assets/styles/components/footer.module.scss";
import MailIcon from "../assets/icons/Mail";
import { HELP_EMAIL } from "../../libs/constants";

const year = new Date().getFullYear()

const Footer: FunctionComponent = () => {

  return (
    <div className={styles.footer}>
      <div className={styles.text}>
        © {year} Disruptive Edge. All Rights Reserved.
      </div>
      {/* TODO: Add Mail Link */}
      <div className={styles.row}>
        <MailIcon stroke="#4318FF" width={24} height={24} />
        <a href={`mailto:${HELP_EMAIL}`}>{HELP_EMAIL}</a>
      </div>
    </div>
  );
};

export default Footer;
