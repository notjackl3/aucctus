import { FunctionComponent, useState } from "react";


import ChallengeStarter from "../components/ChallengeStarter";

import styles from '../assets/styles/pages/challenge-center.module.scss'
import { IChallengeResponse } from "../../libs/api/typings/challenges";
import { useQuery } from "react-query";
import api from "../../libs/api";
import ChallengeBox from "../components/ChallengeBox";

const ChallengeCenter: FunctionComponent = () => {
  const [challenges, setChallenges] = useState<IChallengeResponse[]>([])


  const query = useQuery({
    queryKey: 'challenges',
    retry: 2,
    queryFn: async () => await api.challenge.getChallenges(),
    onSuccess: (response) => {
      setChallenges(response)
    },
    onError: (error) => {
      alert(error)
    }
  })


  return (
    <div className={styles.challengeCenter}>
      <div className={styles.header}>
        <h1>Challenge Center</h1>
      </div>
      <div className={styles.content}>
        {challenges.length === 0 ?
          <div className={styles.starterContainer}>
            <ChallengeStarter />
          </div>

          :
          <>

            {challenges.map((challenge) =>
              <ChallengeBox
                id={challenge.id}
                title={challenge.title}
                description={challenge.description}
                ideasSubmitted={0}
                endDate={challenge.endDate}
                employeesEngaged={0}
              />
            )
            }
          </>
        }

      </div>
    </div>
  )
}

export default ChallengeCenter;