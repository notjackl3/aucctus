import React, { FunctionComponent, useEffect } from 'react';
import { refreshAuth, selectUser } from '../../features/auth/auth.slice';
import { useAppDispatch } from '../../app/hooks';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import styles from "../../app/assets/styles/pages/auth-screens.module.scss"
import Footer from '../../app/components/Footer';
import AuthHeader from '../../app/components/AuthHeader';
import IntoSection from '../../app/components/IntoSection';
import { useSelector } from 'react-redux';
import { AppPath } from '../routes';





const UnauthGuard: FunctionComponent = () => {

  const user = useSelector(selectUser)
  const location = useLocation()

  // TODO: Change this. This causes refreshAuth to get called twice do to the way components render (use class component?)
  // useEffect(() => {
  //   dispatch(refreshAuth())
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  if (user) {
    return (
      <Navigate to={AppPath.Home} state={{ from: location }} replace />
    )
  }

  return (
    <div className={`${styles.authContainer}`}>
      <div className={`${styles.formSection}`}>
        <AuthHeader />
        <div className={styles.form}>
          <Outlet />
        </div>
        <Footer />
      </div>
      <IntoSection />
    </div>
  )

}

export default UnauthGuard;