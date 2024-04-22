import { FunctionComponent, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import FeatureIcon, { IFeatureIconProps } from '../../components/FeatureIcon';
import { AppPath } from '../../../routes/routes';
import Icon from '../../components/Icon/Icon';
import { useSearchParams } from 'react-router-dom';
import { useConfirmEmail } from '../../hooks/query/auth';
import { parseFormError } from '../../../libs/utils';
import { toast } from 'react-toastify';

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
          const message = parseFormError(error);
          toast.error(message);
        },
      });
    }
  }, [mutate, token]);

  const context: IConfirmEmailContext = useMemo(() => {
    return error || !token
      ? {
          icon: 'warning',
          color: 'yellow',
          title: 'Token Invalid or Expired',
          supportingText:
            'Please try logging in again to receive a new email confirmation link, or if the issue persists contact your admin.',
        }
      : {
          icon: 'mail',
          title: 'Your Email is Confirmed!',
          color: 'green',
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
            <Icon variant="arrowleft" /> Back to log in
          </Link>
        </div>
      </form>
    </>
  );
};

export default ConfirmEmail;
