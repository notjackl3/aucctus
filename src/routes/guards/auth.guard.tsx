import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../../features/auth/auth.slice';
import { AppPath } from '../routes';

interface AuthGuardProps {
  component: React.ReactNode
}

const AuthGuard: FunctionComponent<AuthGuardProps> = ({ component }) => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();


  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, component, navigate]);

  return (
    <>{!!user ? component : null} </>
  )

}





export default AuthGuard;