import { FunctionComponent, useCallback, useState } from "react";
import Footer from "../components/Footer";
import HeaderNavigation from "../components/Auth/HeaderNavigation";
import OnboardingIntoSection from "../components/OnboardingIntroSection";

import styles from "../assets/styles/pages/auth-screens.module.scss"
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import InputField from "../components/InputField";

const OnBoarding: FunctionComponent = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailInputError, setEmailInputError] = useState<string | undefined>()
  const [confirmPassInputError, setConfirmPassInputError] = useState<string | undefined>()

  const [error, setError] = useState<string | undefined>()

  const _handleEmailValidation = useCallback((e: React.FocusEvent) => {

  }, [email])

  const _handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {

  }

  const _handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {

  }

  const setConfirmPassErrorOnCondition = (condition: boolean) => {

  }

  const _handleSignup = () => {

  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.formSection}>
        <HeaderNavigation />
        <div className={styles.form}>
          <div className={styles.header}>
            <span className={styles.title}>Welcome aboard!</span>
            <span className={styles.supportingText}>
              Answer the prompts below to start innovating
            </span>
          </div>

          <div className={styles.basicForm}>
            <InputField
              name={"companyName"}
              label={"Company Name"}

              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
            <InputField
              name={"companyUrl"}
              label={"Company Url"}
              error={!!emailInputError}
              errorMessage={emailInputError}
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              onFocus={() => setEmailInputError(undefined)}
              onBlur={_handleEmailValidation}
            />
            <InputField
              name={"goal"}
              label={"What is your organization looking to achieve through innovation?"}
              value={password}
              onChange={_handlePasswordChange}
            />

            <InputField
              name={"competitors"}
              label={"Who are your main competitors?"}
              autoComplete="on"
              isPassword
              error={!!confirmPassInputError}
              errorMessage={confirmPassInputError}
              value={confirmPassword}
              onChange={_handleConfirmPasswordChange}
            />

            <InputField
              name={"competitors"}
              label={"Who are your main competitors?"}
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
            >Complete</button>
          </div>
        </div>
        <Footer />
      </div>
      <OnboardingIntoSection />
    </div>
  )
}


export default OnBoarding;