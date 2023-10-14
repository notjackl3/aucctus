import { FunctionComponent } from "react";

import styles from '../assets/styles/input-field.module.css'


const InputField: FunctionComponent = () => {

  return (
    <div className={styles.inputField}>
      <div className={styles.inputField}>
        <div className={styles.label}>Password</div>
        <div className={styles.input}>
          <div className={styles.content}>
            <div className={styles.text1} />
          </div>
          <img
            className={styles.helpIcon}
            alt=""
            src="/assets/icons/help-icon3.svg"
          />
        </div>
      </div>
      <div className={styles.hintText}>
        This is a hint text to help user.
      </div>
    </div>
  )
}

export default InputField