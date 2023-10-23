import { FunctionComponent } from "react";
import Table from "./Table"

import styles from "../assets/styles/pages/concept-list.module.scss"
import ConceptTable from "../components/ConceptTable";



const ConceptList: FunctionComponent = () => {


  return (
    <div className={styles.container}>

      <ConceptTable />

    </div>
  )
}

export default ConceptList