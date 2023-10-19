import { FunctionComponent } from "react";
import styles from "../assets/styles/components/auth-header.module.scss";
import Logo from "../assets/Logo.svg?react";

const AuthHeader: FunctionComponent = () => {
  return (
    <div className={styles.authHeader}>
      <div className={styles.logo}>
        <Logo width={146} height={30} />
      </div>
    </div>
  );
};

export default AuthHeader;
