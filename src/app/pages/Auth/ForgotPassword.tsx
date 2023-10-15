import { FunctionComponent, useState } from "react";
import styles from "../../assets/styles/pages/auth-screens.module.scss"


const ForgotPassword: FunctionComponent = () => {
  const [email, setEmail] = useState("")


  return (
    <>
      <div className={styles.header}>
        <span className={styles.title}>Forgot Password</span>
        <span className={styles.supportingText}>
          Welcome back! Please enter your details.
        </span>
      </div>
      <div>
        <input name='email' value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />

      </div>
    </>
  )
}

export default ForgotPassword;