import { FunctionComponent } from "react";
import styles from "./HeaderNavigation.module.css";
import Logo from "../../assets/icons/Logo";

const HeaderNavigation: FunctionComponent = () => {
  return (
    <div className={styles.headerNavigation}>
      <div className={styles.logo}>
        <Logo />
      </div>
    </div>
  );
};

export default HeaderNavigation;
