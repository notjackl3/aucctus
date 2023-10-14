import { FunctionComponent, useState } from "react";
import IntoSection from "../../components/Auth/IntoSection";
import styles from "../../assets/styles/pages/auth-screens.module.scss"
import HeaderNavigation from "../../components/Auth/HeaderNavigation";
import Footer from "../../components/Footer";
import InputField from "../../components/InputField";
import AuthProviderIcon from "../../assets/icons/SocialIcon";
import Checkbox from "../../components/CheckBox";

const SignIn: FunctionComponent = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")





  return (
    <div className={`${styles.authContainer}`}>
      <div className={`${styles.formSection}`}>
        <HeaderNavigation />
        <div className={styles.form}>
          <div className={styles.header}>
            <span className={styles.title}>Log in</span>
            <span className={styles.supportingText}>
              Welcome back! Please enter your details.
            </span>
          </div>
          <div className={`${styles.basicForm}`}>
            <InputField label="Email" name='email' value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
            <InputField label="Password" name='password' isPassword value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />

            <div className={`${styles.row}`}>
              <Checkbox
                name="rememberMe"
                supportingText="Remember for 30 Days"
              />

              <a className={`${styles.link} btn btn-link`} href="/forgot-password">Forgot password</a>

            </div>

            <button type="button" className="btn btn-primary">Sign in</button>

            <button type="button" className="btn btn-white">
              <AuthProviderIcon provider="google" />
              Sign in with Google
            </button>
            <div className={styles.signUp}>
              <span>Don't have an account? </span>
              <a className={`${styles.link} btn btn-link`} href="/sign-up">Sign up</a>
            </div>

          </div>
        </div>
        <Footer />
      </div>
      <IntoSection />
    </div>
  )
}

export default SignIn;