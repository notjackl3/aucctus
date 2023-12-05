import { FunctionComponent, useState } from "react";
import FeatureIcon from "../components/FeatureIcon";
import InputField from "../components/InputField";

import styles from '../assets/styles/pages/challenge-wizard.module.scss'
import TextArea from "../components/TextArea";
import { useQuery } from "react-query";
import api from "../../libs/api";

const ChallengeWizard: FunctionComponent = () => {
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [pains, setPains] = useState<string>('')
  const [q4, setQ4] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const query = useQuery({
    queryKey: 'challenge',
    queryFn: async () => api.challenge.createChallenge({ title, description, pains, q4, endDate })

  })

  return (
    <div className={styles.challengeWizard}>
      <div className={styles.header}>
        <FeatureIcon icon="beaker" color="purple" />
        <div className={styles.supportingText}>
          <h1>Challenge Wizard</h1>
          <span>Fill in the following fields to generate a challenge</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.challengeInfo}>
          <InputField
            label="Give your challenge a title*"
            name="title"
            placeholder="Financial Service Platform"
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextArea
            label="Describe your challenge*"
            name="description"
            placeholder="Financial Service PlatformOur company is exploring a new service line in the financial service space. We are looking for a digital platform that houses everyday banking and financial service products that customers need on a day-to-day basis."
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextArea
            label="What are the main pains you are trying to solve*"
            name="pains"
            placeholder="Financial Service PlatformOur company is exploring a new service line in the financial service space. We are looking for a digital platform that houses everyday banking and financial service products that customers need on a day-to-day basis."
            rows={4}
            onChange={(e) => setPains(e.target.value)}
          />

          <InputField
            label="Q4*"
            name="q4"
            placeholder="xxxxx"
            onChange={(e) => setQ4(e.target.value)}
          />


          <InputField
            type="date"
            label="When do you want this challenge to end?*"
            name="endDate"
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button className="btn btn-primary"
            onClick={(e) => {
              // query.refetch()
              e.preventDefault()
            }}
          >
            Publish Challenge
          </button>


        </div>
      </div>

    </div>
  )
}

export default ChallengeWizard;