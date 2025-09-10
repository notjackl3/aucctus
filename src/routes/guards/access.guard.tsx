import useStore from '@stores/store';
import { FunctionComponent, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppPath } from '../routes';

const AccessGuard: FunctionComponent = () => {
  const { user } = useStore((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (!user.firstName || !user.lastName) {
        navigate(AppPath.SettingsAbout);
      }
    }
  }, [user, navigate]);

  return <Outlet />;
};

export default AccessGuard;
