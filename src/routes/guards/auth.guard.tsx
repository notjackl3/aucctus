import { FunctionComponent, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppPath } from '../routes';
import { useApp } from '../../app/context/AppContextProvider';

const AuthGuard: FunctionComponent = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(AppPath.Login, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return <Outlet />;
};

export default AuthGuard;
