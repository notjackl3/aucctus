import { FunctionComponent } from "react";
import styles from "../assets/styles/components/auth-header.module.scss";
import Logo from "../assets/Logo.png";

const AuthHeader: FunctionComponent = () => {
  return (
    <div className={styles.authHeader}>
      <div className={styles.logo}>
        <img
          alt="Logo"
          style={{ height: 30, width: 146 }}
          src={Logo}
        />
      </div>
    </div>
  );
};

export default AuthHeader;
