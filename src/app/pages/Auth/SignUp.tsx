import { FunctionComponent, useCallback, useState } from "react";

import styles from "../../assets/styles/pages/auth-screens.module.scss"
import InputField from "../../components/InputField";
import { validEmail } from "../../../libs/utils";
import { AppPath } from "../../../routes/routes";
import { useAppDispatch } from "../../hooks";
import { signUp } from "../../../features/auth/auth.slice";
import analytics from "../../../libs/analytics";
import { useNavigate } from "react-router-dom";

// TODO: Show loading
const SignUp: FunctionComponent = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailInputError, setEmailInputError] = useState<string | undefined>()
  const [confirmPassInputError, setConfirmPassInputError] = useState<string | undefined>()

  const [error, setError] = useState<string | undefined>()

  const _handleEmailValidation = useCallback((e: React.FocusEvent) => {
    if (email && !validEmail(email)) {
      setEmailInputError("Email is Invalid.")
    } else {
      setEmailInputError(undefined)
    }
  }, [email])

  const _handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pass = e.target.value;
    setPassword(pass);
    setConfirmPassErrorOnCondition(!!confirmPassword && confirmPassword !== pass)
  }

  const _handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cPassword = e.target.value;
    setConfirmPassword(cPassword);
    setConfirmPassErrorOnCondition(cPassword !== password)
  }

  const setConfirmPassErrorOnCondition = (condition: boolean) => {
    if (condition) {
      setConfirmPassInputError("Passwords do not match")
    } else {
      setConfirmPassInputError(undefined)
    }
  }

  const _handleSignup = () => {
    dispatch(signUp({
      name,
      email,
      password,
      confirmPassword
    })).unwrap()
      .then(((value) => {
        navigate(AppPath.SignUpSuccess)
      }))
      .catch((e) => {
        if ('message' in e) {
          setError(e.message)
        } else {
          setError('Oops Something went wrong.')

        }
        analytics.debug(e)
      })

  }

  return (
    <>
      <div className={styles.header}>
        <span className={styles.title}>Sign Up</span>
        <span className={styles.supportingText}>
          Start your 30-day free trial
        </span>
      </div>
      {error && <div>
        {error}
      </div>}
      <div className={styles.basicForm}>
        <InputField
          name={"name"}
          label={"Name*"}
          autoComplete="on"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <InputField
          name={"email"}
          label={"Email*"}
          autoComplete="on"
          error={!!emailInputError}
          errorMessage={emailInputError}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          onFocus={() => setEmailInputError(undefined)}
          onBlur={_handleEmailValidation}
        />
        <InputField
          name={"password"}
          label={"Password*"}
          autoComplete="on"
          isPassword
          value={password}
          onChange={_handlePasswordChange}
        />

        <InputField
          name={"confirm-password"}
          label={"Confirm Password*"}
          autoComplete="on"
          isPassword
          error={!!confirmPassInputError}
          errorMessage={confirmPassInputError}
          value={confirmPassword}
          onChange={_handleConfirmPasswordChange}
        />

        <button
          type="button"
          className="btn btn-primary"
          onClick={_handleSignup}
          disabled={!name || !email || !password || !!emailInputError || !!confirmPassInputError}
        >Sign Up</button>

        <div className={styles.signUp}>
          <span>Already have an account?</span>
          <a className={`${styles.link} btn btn-link`} href={AppPath.SignIn}>Sign In</a>
        </div>

      </div>
    </>
  )
}

export default SignUp;