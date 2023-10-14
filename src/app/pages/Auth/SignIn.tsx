import { FunctionComponent, useCallback, useState } from "react";
import IntoSection from "../../components/Auth/IntoSection";
import styles from "../../assets/styles/pages/auth-screens.module.scss"
import HeaderNavigation from "../../components/Auth/HeaderNavigation";
import Footer from "../../components/Footer";
import InputField from "../../components/InputField";
import AuthProviderIcon from "../../assets/icons/SocialIcon";
import Checkbox from "../../components/CheckBox";
import { selectUser, signIn } from "../../../features/auth/auth.slice";
import { useAppDispatch } from "../../hooks";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const SignIn: FunctionComponent = () => {
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | undefined>()
  const user = useSelector(selectUser)


  const _handleSignIn = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    dispatch(signIn({ usernameOrEmail: email, password }))
  }, [dispatch, email, password])


  if (user) {
    return (
      <Navigate to={"/"} />
    )
  }

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
          {error && <div>
            {error}
          </div>}
          <div className={`${styles.basicForm}`}>
            <InputField label="Email" name='email' autoComplete="on" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
            <InputField label="Password" name='password' autoComplete="on" isPassword value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />

            <div className={`${styles.row}`}>

              {/* Currently Does nothing */}
              <Checkbox
                name="rememberMe"
                supportingText="Remember for 30 Days"
              />

              <a className={`${styles.link} btn btn-link`} href="/forgot-password">Forgot password</a>

            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={_handleSignIn}

            >Sign in</button>

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