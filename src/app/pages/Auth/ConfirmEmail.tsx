import { FunctionComponent, useEffect } from "react";
import { useAppDispatch } from "../../hooks";
import { useParams } from "react-router-dom";
import { confirmEmail } from "../../../features/auth/auth.slice";


const ConfirmEmail: FunctionComponent = () => {
  const dispatch = useAppDispatch()
  const { token } = useParams();


  useEffect(() => {
    if (token) {
      dispatch(confirmEmail(token))
    }
  }, [dispatch, token])



  return (
    <>
      Confirm Email
    </>
  )
}

export default ConfirmEmail;