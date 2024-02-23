import { FunctionComponent } from 'react';
import Card from './Card';

import styles from '../assets/styles/components/innovation-activity-lifecycle.module.scss';
import images from '../assets/img';

interface InnovationActivityProps {}

const InnovationActivity: FunctionComponent<InnovationActivityProps> = () => {
  return (
    <Card>
      <div className={styles.header}>
        <h2>Innovation Activity</h2>
        <div className="dropdown">
          <button
            className="btn btn-secondary dropdown-toggle disabled"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            90 Days
          </button>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a className="dropdown-item" href="#">
              Action
            </a>
            <a className="dropdown-item" href="#">
              Another action
            </a>
            <a className="dropdown-item" href="#">
              Something else here
            </a>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <img alt="Innovation Activity" src={images.innovationActivity} />

        <div className="comingSoon">
          <div className="comingSoonWrapper">
            <div className="comingSoonText">Coming Soon</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InnovationActivity;
