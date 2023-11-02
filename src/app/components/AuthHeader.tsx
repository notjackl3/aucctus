import { FunctionComponent } from "react";
import styles from "../assets/styles/components/auth-header.module.scss";
import Logo from "../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import { AppPath } from "../../routes/routes";

const AuthHeader: FunctionComponent = () => {
  const navigate = useNavigate()
  return (
    <div className={styles.authHeader}>
      <div className={styles.logo}
        onClick={() => {
          navigate(AppPath.SignIn)
        }}
      >
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
