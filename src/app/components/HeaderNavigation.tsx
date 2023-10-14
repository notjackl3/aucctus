import { FunctionComponent } from "react";
import styles from "./HeaderNavigation.module.css";

const HeaderNavigation: FunctionComponent = () => {
  return (
    <div className={styles.headerNavigation}>
      <div className={styles.logo}>
        <img className={styles.logoIcon} alt="" src="/assets/icons/logo1.svg" />
      </div>
    </div>
  );
};

export default HeaderNavigation;
