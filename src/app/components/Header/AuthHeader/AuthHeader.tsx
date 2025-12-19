import { FunctionComponent } from 'react';
import styles from './auth-header.module.scss';
import NavWord from '../../../assets/aucctus_nav_word.png';
import NavLogo from '../../../assets/aucctus_logo.png';
import { useClerk } from '@clerk/clerk-react';
import { resetAllStoreData } from '@stores/store';

const AuthHeader: FunctionComponent = () => {
  const { signOut } = useClerk();
  return (
    <div className={styles.authHeader}>
      <div
        className={styles.logo}
        onClick={() => {
          // Used in the case of onboarding where the user is actually logged in but are not tied to their multi-tenancy "Account".
          signOut().then(() => {
            resetAllStoreData();
          });
        }}
      >
        <img alt='Logo' className='w-[45px]' src={NavLogo} />
        <img alt='Logo' className='mb-1 ml-[1px] w-[145px]' src={NavWord} />
      </div>
    </div>
  );
};

export default AuthHeader;
