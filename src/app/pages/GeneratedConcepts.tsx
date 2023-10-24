import { FunctionComponent } from "react";
import styles from "../assets/styles/pages/generated-concept.module.scss"
import ConceptTable from "../components/ConceptTable";
import { useNavigate } from "react-router-dom";

import DownloadIcon from '../assets/icons/download.svg?react'
import RefreshIcon from '../assets/icons/refresh.svg?react'

const GeneratedConcepts: FunctionComponent = () => {
  const navigate = useNavigate()


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.text}>
          <h3>Generated Concepts</h3>
          <span className={styles.supportingText}>
            From the list below, choose the top concepts that you want to keep and continue building on
          </span>
        </div>
        <div className={styles.actionable}>
          <button className="btn btn-light">
            <DownloadIcon height={20} width={20} />
            Export
          </button>
          <button className="btn btn-light"><RefreshIcon height={20} width={20} /> Generate more</button>
          <button className="btn btn-primary"
            onClick={() => {
              // navigate(AppPath.IgniteConcept)
            }}
          >
            Save
          </button>
        </div>
      </div>

      <ConceptTable />

    </div>
  )
}

export default GeneratedConcepts