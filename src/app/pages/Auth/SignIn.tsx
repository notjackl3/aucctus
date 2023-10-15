import { FunctionComponent, useCallback, useState } from "react";
import styles from "../../assets/styles/pages/auth-screens.module.scss"
import InputField from "../../components/InputField";
import AuthProviderIcon from "../../assets/icons/SocialIcon";
import Checkbox from "../../components/CheckBox";
import { signIn } from "../../../features/auth/auth.slice";
import { useAppDispatch } from "../../hooks";
import { validEmail } from "../../../libs/utils";
import { AppPath } from "../../../routes/routes";
import analytics from "../../../libs/analytics";

const SignIn: FunctionComponent = () => {
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [emailInputError, setEmailInputError] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()

  const _handleSignIn = useCallback(() => {
    dispatch(signIn({ email: email, password })).unwrap().catch((e) => {
      if ('message' in e) {
        setError(e.message)
      } else {
        setError('Oops Something went wrong.')

      }
      analytics.debug(e)
    })
  }, [dispatch, email, password])

  const _handleEmailValidation = (e: React.FocusEvent) => {
    if (email && !validEmail(email)) {
      setEmailInputError("Email is Invalid.")
    } else {
      setEmailInputError(undefined)
    }
  }

  return (
    <>
      <div className={styles.header}>
        <span className={styles.title}>Log in</span>
        <span className={styles.supportingText}>
          Welcome back! Please enter your details.
        </span>
      </div>
      {error && <div>
        {error}
      </div>}
      <div className={styles.basicForm}>
        <InputField
          label="Email"
          name='email'
          autoComplete="on"
          error={!!emailInputError}
          errorMessage={emailInputError}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          onFocus={(e) => setEmailInputError(undefined)}
          onBlur={_handleEmailValidation}
        />

        <InputField
          label="Password"
          name='password'
          autoComplete="on"
          isPassword
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />

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
          disabled={!email || !password || !!emailInputError}

        >Sign in</button>

        <button type="button" className="btn btn-white">
          <AuthProviderIcon provider="google" />
          Sign in with Google
        </button>


        <div className={styles.signUp}>
          <span>Don't have an account? </span>
          <a className={`${styles.link} btn btn-link`} href={AppPath.SignUp}>Sign up</a>
        </div>

      </div>
    </>
  )
}

export default SignIn;