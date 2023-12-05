import { FunctionComponent } from "react";


import styles from "../assets/styles/components/challenge-box.module.scss"
import images from "../assets/img";
import { useNavigate } from "react-router-dom";
import { AppPath } from "../../routes/routes";
import Icon from "./Icon";



const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: "#7586a9"

}

interface ChallengeBoxProps {
  id: string;
  title: string;
  description: string
  ideasSubmitted: number;
  endDate: string;
  employeesEngaged: number;


}

const ChallengeBox: FunctionComponent<ChallengeBoxProps> = ({ id, title, description, ideasSubmitted, endDate, employeesEngaged }) => {
  const navigate = useNavigate()


  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header} >
          <img
            alt="Challenge"
            src={images.challengeCircle}
          />
          <div className={styles.supportingText}>
            <span className={styles.title}>{title}</span>
            <span className={styles.overview}>{description}</span>
          </div>
        </div>

        <div className={styles.importantMetrics} >
          <span className={styles.metricHeader}>Important Metrics</span>

          <div className={styles.metric}>
            <div>
              <Icon variant="lightbulb" {...iconDefaultProps} />
              <span>Ideas Submitted</span>
            </div>
            <span>{ideasSubmitted}</span>
          </div>

          <div className={styles.metric}>
            <div>
              <Icon variant="calendar" {...iconDefaultProps} />
              <span>Submission End Date</span>
            </div>
            <span>{new Date(endDate).toLocaleDateString("en-US")}</span>
          </div>

          <div className={styles.metric}>
            <div>
              <Icon variant="userGroup" {...iconDefaultProps} />
              <span>Employees Engaged</span>
            </div>
            <span>{employeesEngaged}</span>
          </div>

        </div>

      </div>
      <div className={styles.actionable}>
        <div>
          {/* // TEMP Disable
          <div className={styles.newDomain}> */}
          {/* <ThreeStarIcon {...iconDefaultProps} stroke="#039855" />
          New Domain */}
        </div>

        <button
          className={`btn btn-light`}
          onClick={() => {
            navigate(AppPath.ChallengeDetails.replace(":id", id), {

            })
          }}

        >
          See Challenge
          <Icon variant="arrowRight"{...iconDefaultProps} stroke="#626ba3" />
        </button>


      </div>
    </div>
  )
}

export default ChallengeBox