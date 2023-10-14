import { FunctionComponent } from "react";
import IntoSection from "../../components/Auth/IntoSection";
import styles from "../../assets/styles/pages/auth-screens.module.scss"
import HeaderNavigation from "../../components/Auth/HeaderNavigation";

const SignIn: FunctionComponent = () => {

  return (
    <div className={`${styles.authContainer}`}>
      <div className={`${styles.formContainer}`}>
        <HeaderNavigation />



      </div>
      <IntoSection />
    </div>
  )
}

export default SignIn;