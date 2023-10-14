import { FunctionComponent } from "react";
import HeaderNavigation from "./Auth/HeaderNavigation";
import Footer from "./Footer";
import styles from "./LoginContainer.module.css";

const LoginContainer: FunctionComponent = () => {
  return (
    <div className={styles.section}>
      <HeaderNavigation />
      <div className={styles.logInForm}>
        <div className={styles.header}>
          <div className={styles.text}>Log in</div>
          <div className={styles.supportingText}>
            Welcome back! Please enter your details.
          </div>
        </div>
        <div className={styles.basicForm}>
          <div className={styles.inputField}>
            <div className={styles.inputField}>
              <div className={styles.label}>Email</div>
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
          <div className={styles.row}>
            <div className={styles.checkbox}>
              <div className={styles.input2}>
                <img
                  className={styles.checkboxBaseIcon}
                  alt=""
                  src="/assets/icons/checkedtrue-indeterminatefalse-sizesm-typecheckbox-statedefault.svg"
                />
              </div>
              <div className={styles.textAndSupportingText}>
                <div className={styles.text3}>Remember for 30 days</div>
                <div className={styles.hintText}>
                  Save my login details for next time.
                </div>
              </div>
            </div>
            <div className={styles.button}>
              <img
                className={styles.placeholderIcon}
                alt=""
                src="/assets/icons/placeholder18.svg"
              />
              <div className={styles.label}>Forgot password</div>
              <img
                className={styles.placeholderIcon}
                alt=""
                src="/assets/icons/placeholder18.svg"
              />
            </div>
          </div>
          <div className={styles.button1}>
            <img
              className={styles.placeholderIcon2}
              alt=""
              src="/assets/icons/placeholder19.svg"
            />
            <div className={styles.text5}>Sign in</div>
            <img
              className={styles.placeholderIcon}
              alt=""
              src="/assets/icons/placeholder20.svg"
            />
          </div>
          <div className={styles.oauth20Login}>
            <div className={styles.socialButton}>
              <img
                className={styles.socialIcon}
                alt=""
                src="/assets/icons/social-icon8.svg"
              />
              <div className={styles.text6}>Sign in with Google</div>
            </div>
            <div className={styles.socialButton1}>
              <img
                className={styles.socialIcon}
                alt=""
                src="/assets/icons/social-icon1.svg"
              />
              <div className={styles.text6}>Sign in with Facebook</div>
            </div>
            <div className={styles.socialButton1}>
              <img
                className={styles.socialIcon}
                alt=""
                src="/assets/icons/social-icon9.svg"
              />
              <div className={styles.text6}>Sign in with Apple</div>
            </div>
            <div className={styles.socialButton1}>
              <img
                className={styles.socialIcon}
                alt=""
                src="/assets/icons/social-icon10.svg"
              />
              <div className={styles.text6}>Sign in with Twitter</div>
            </div>
          </div>
          <div className={styles.row1}>
            <div className={styles.text10}>Don’t have an account?</div>
            <div className={styles.button2}>
              <img
                className={styles.placeholderIcon}
                alt=""
                src="/assets/icons/placeholder21.svg"
              />
              <div className={styles.label}>Sign up</div>
              <img
                className={styles.placeholderIcon}
                alt=""
                src="/assets/icons/placeholder21.svg"
              />
            </div>
          </div>
          <div className={styles.button3}>
            <img
              className={styles.arrowLeftIcon}
              alt=""
              src="/assets/icons/arrowleft2.svg"
            />
            <div className={styles.label}>Back to log in</div>
            <img
              className={styles.placeholderIcon}
              alt=""
              src="/assets/icons/placeholder22.svg"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginContainer;
