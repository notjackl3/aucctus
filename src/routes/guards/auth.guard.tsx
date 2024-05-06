import { FunctionComponent, useEffect } from 'react';

import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/context/Auth/AuthContextProvider';
import { AppPath } from '../routes';

const AuthGuard: FunctionComponent = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(AppPath.Login, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return <Outlet />;
};

export default AuthGuard;
