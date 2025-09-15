import useStore from '@stores/store';
import { FunctionComponent, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from '../routes';

const ALLOWED_ROUTES = [AppPath.Onboarding];

const AccessGuard: FunctionComponent = () => {
  const { user } = useStore((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !ALLOWED_ROUTES.includes(location.pathname as AppPath)) {
      if (!user.firstName || !user.lastName) {
        navigate(AppPath.SettingsAbout);
      }
    }
  }, [user, navigate, location.pathname]);

  return <Outlet />;
};

export default AccessGuard;
