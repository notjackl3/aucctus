import { FunctionComponent } from "react";
import IgniteForm from "../components/IgniteForm";

import styles from '../assets/styles/pages/ignite.module.scss'



const IgniteDomain: FunctionComponent = () => {
  return (
    <div className={styles.ignite} >
      <IgniteForm
        title="Ignite Your Domain"
        subtitle="These answers will kick start your domain generation process"
      >


      </IgniteForm>
    </div >
  )
}

export default IgniteDomain;