import { Navigate, Outlet } from "react-router-dom";
import NavDrawer from "../app/components/NavDrawer/NavDrawer"
import { useSelector } from "react-redux";
import { selectAccount, selectUser, setAccount } from "../features/auth/auth.slice";
import { AppPath } from "../routes/routes";
import styles from "../app/assets/styles/layout.module.scss"
import { useAppDispatch } from "../app/hooks";
import { useState } from "react";
import { useQuery } from "react-query";
import api from "../libs/api";


const Layout = () => {
  const dispatch = useAppDispatch()
  const user = useSelector(selectUser)!;
  const account = useSelector(selectAccount);
  const [checked, setChecked] = useState(false);


  useQuery({
    queryKey: ['account'],
    queryFn: async () => api.account.getAccount(),
    enabled: !!user.account && !account && !checked,
    onSuccess: (data) => {
      dispatch(setAccount(data))
    },
    cacheTime: 1000 * 60,
    onSettled: () => {
      setChecked(true)
    }
  })

  if (!user.account) {
    return <Navigate to={AppPath.Onboarding} />
  }

  return (
    <div className={styles.container}>
      <NavDrawer />
      <Outlet />
    </div>
  )

}

export default Layout;