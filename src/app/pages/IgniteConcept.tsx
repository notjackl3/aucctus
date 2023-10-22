import { FunctionComponent } from "react";
import IgniteForm from "../components/IgniteForm";
import styles from '../assets/styles/pages/ignite.module.scss'



const IgniteConcept: FunctionComponent = () => {
  return (
    <div className={styles.ignite} >
      <IgniteForm
        title="Ignite Your Concept"
        subtitle="These answers will kick start your concept innovation process"
      >


      </IgniteForm>
    </div >
  )
}

export default IgniteConcept;