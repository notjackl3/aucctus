import { FunctionComponent } from "react";
import styles from "../assets/styles/components/auth-header.module.scss";
import Logo from "../assets/icons/Logo";

const AuthHeader: FunctionComponent = () => {
  return (
    <div className={styles.authHeader}>
      <div className={styles.logo}>
        <Logo />
      </div>
    </div>
  );
};

export default AuthHeader;
