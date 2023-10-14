import { FunctionComponent, useState } from "react";
import IntoSection from "../../components/Auth/IntoSection";
import styles from "../../assets/styles/pages/auth-screens.module.scss"
import HeaderNavigation from "../../components/Auth/HeaderNavigation";
import Footer from "../../components/Footer";

const Register: FunctionComponent = () => {
  const [email, setEmail] = useState("")


  return (
    <div className={`${styles.authContainer}`}>
      <div className={`${styles.formSection}`}>
        <HeaderNavigation />
        <div className={styles.form}>
          <div className={styles.header}>
            <div className={styles.text}>Log in</div>
            <div className={styles.supportingText}>
              Welcome back! Please enter your details.
            </div>
          </div>
          <div>
            <input name='email' value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />

          </div>
        </div>
        <Footer />
      </div>
      <IntoSection />
    </div>
  )
}

export default Register;