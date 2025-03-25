import utils from '@libs/utils';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppPath } from '../../../routes/routes';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import FeatureIcon, {
  IFeatureIconProps,
} from '../../components/Icon/FeatureIcon';
import Icon from '../../components/Icon/Icon/Icon';
import { useConfirmEmail } from '../../hooks/query/auth.hook';

interface IConfirmEmailContext {
  icon: IconVariant;
  color: IFeatureIconProps['color'];
  title: string;

  supportingText: string;
}

const ConfirmEmail: FunctionComponent = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, _] = useSearchParams();
  const { mutate, error } = useConfirmEmail();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      mutate(token, {
        onError: (error) => {
          const message = utils.osiris.parseFormError(error);
          toast.error(message);
        },
      });
    }
  }, [mutate, token]);

  const context: IConfirmEmailContext = useMemo(() => {
    return error || !token
      ? {
          icon: 'warning',
          color: 'warning',
          title: 'Token Invalid or Expired',
          supportingText:
            'Please try logging in again to receive a new email confirmation link, or if the issue persists contact your admin.',
        }
      : {
          icon: 'mail',
          title: 'Your Email is Confirmed!',
          color: 'success',
          supportingText: 'Please return to the login page to sign in.',
        };
  }, [error, token]);

  return (
    <>
      <div className={`${styles.header} ${styles.h2}`}>
        <FeatureIcon icon={context.icon} color={context.color} />
        <span className={styles.title}>{context.title}</span>
        <span className={styles.supportingText}>{context.supportingText}</span>
      </div>
      <form className={styles.basicForm}>
        <div className={styles.signUp}>
          <Link className={`${styles.backArrow}`} to={AppPath.Login}>
            <Icon variant='arrowleft' height={20} width={20} /> Back to log in
          </Link>
        </div>
      </form>
    </>
  );
};

export default ConfirmEmail;
