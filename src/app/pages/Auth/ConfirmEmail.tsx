import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import { ArrowLeft, Mail } from 'lucide-react';
const ConfirmEmail: FunctionComponent = () => {
  return (
    <>
      <div className={`${styles.header} ${styles.h2}`}>
        <span className='flex h-12 w-12 items-center justify-center rounded-full bg-primary-100'>
          <Mail className='h-6 w-6 stroke-primary-700' />
        </span>
        <span className={styles.title}>Confirm Email</span>
        <span className={styles.supportingText}>
          Please check your email and confirm your email address.
        </span>
      </div>
      <form className={styles.basicForm}>
        <div className={styles.signUp}>
          <Link className={`${styles.backArrow}`} to={AppPath.Login}>
            <ArrowLeft size={20} stroke='stroke-primary-800' /> Back to log in
          </Link>
        </div>
      </form>
    </>
  );
};

export default ConfirmEmail;
