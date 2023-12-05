import { FunctionComponent } from "react";


import ChallengeStarter from "../components/ChallengeStarter";

import styles from '../assets/styles/pages/challenge-center.module.scss'

const ChallengeCenter: FunctionComponent = () => {



  return (
    <div className={styles.challengeCenter}>
      <div className={styles.header}>
        <h1>Challenge Center</h1>
      </div>
      <div className={styles.content}>
        <ChallengeStarter />

      </div>
    </div>
  )
}

export default ChallengeCenter;