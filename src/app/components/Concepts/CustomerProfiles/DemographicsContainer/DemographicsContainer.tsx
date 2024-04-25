import { FunctionComponent } from 'react';

import styles from './demographics-container.module.scss';
import Icon from '../../../Icons/Icon/Icon';

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

interface IDemographicsContainerProps {
  geoLocation: string;
  ageRange: string;
  familySize: number | string;
  incomeRange: string;
}

const DemographicsContainer: FunctionComponent<IDemographicsContainerProps> = ({
  geoLocation,
  ageRange,
  familySize,
  incomeRange,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h2>Demographics</h2>
        <div className={styles.content}>
          <span>
            <Icon variant="globe" {...iconDefaultProps} />
            <p>{`Geographic Location: ${geoLocation}`}</p>
          </span>
          <span>
            <Icon variant="umbrella" {...iconDefaultProps} />
            <p>{`Age Range: ${ageRange}`}</p>
          </span>
          <span>
            <Icon variant="user-group" {...iconDefaultProps} />
            <p>{`Family Size: ${familySize}`}</p>
          </span>
          <span>
            <Icon variant="piggy-bank" {...iconDefaultProps} />
            <p>{`Average Income: ${incomeRange}`}</p>
          </span>
        </div>
      </div>
    </div>
  );
};

export default DemographicsContainer;
