import React, { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../../features/auth/auth.slice';
interface AuthGuardProps {
  component: React.ReactNode
}

const AuthGuard: FunctionComponent<AuthGuardProps> = ({ component }) => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    }
  }, [user, component, navigate]);

  return (
    <>{!!user ? component : null} </>
  )

}

export default AuthGuard;