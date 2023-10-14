import { FunctionComponent } from "react";
import InputField from "../../components/InputField";
import LoginContainer from "../../components/LoginContainer";
import IntoSection from "../../components/IntoSection";

import styles from '../../assets/styles/pages.module.css'

const SignIn: FunctionComponent = () => {

  return (
    <div className={styles.signin}>
      <LoginContainer />
      <IntoSection shadow />
    </div>
  )
}

export default SignIn;