import { FunctionComponent } from "react";
import Card from "./Card";
import images from "../assets/img";
import styles from '../assets/styles/components/innovation-activity-lifecycle.module.scss';

interface InnovationLifecycleProps { }

const InnovationLifecycle: FunctionComponent<InnovationLifecycleProps> = () => {

  return (
    <Card>
      <div className={styles.header}>
        <div className={styles.supportingText}>
          <h2>Innovation Lifecycle</h2>
          <span>Track how concepts evolve into commercialized products</span>
        </div>
      </div>
      <div className={styles.content}>
        <img
          alt="Innovation Lifecycle"
          src={images.innovationLifeCycle}
          width={690}
        />

        <div className="comingSoon">
          <div className="comingSoonWrapper">
            <div className="comingSoonText">Coming Soon</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default InnovationLifecycle;