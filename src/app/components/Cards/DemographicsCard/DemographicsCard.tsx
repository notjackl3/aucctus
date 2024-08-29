import { FunctionComponent } from 'react';

import { Icon } from '@components';
import EditCustomerProfileDemographics from '@components/Modal/CustomerProfile/EditCustomerProfileDemographics';
import { useModal } from '@context/ModalContextProvider';
import { ICustomerProfile } from '@libs/api/types';
import styles from './demographics-card.module.scss';

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

interface IDemographicsProps {
  profile: ICustomerProfile;
  canEdit?: boolean;
}

const Demographics: FunctionComponent<IDemographicsProps> = ({
  profile,
  canEdit = false,
}) => {
  const { openModal } = useModal();

  return (
    <div
      className={`${styles.container} ${canEdit ? styles.edit : ''}`}
      onClick={() => {
        if (canEdit) {
          openModal(EditCustomerProfileDemographics, {
            profile,
          });
        }
      }}
    >
      <div className={styles.wrapper}>
        <h2>Demographics</h2>
        <div className={styles.content}>
          <span>
            <Icon variant='globe' {...iconDefaultProps} />
            <p>{`Geographic Location: ${profile.geoLocation}`}</p>
          </span>
          <span>
            <Icon variant='umbrella' {...iconDefaultProps} />
            <p>{`Age Range: ${profile.ageRange}`}</p>
          </span>
          <span>
            <Icon variant='user-group' {...iconDefaultProps} />
            <p>{`Family Size: ${profile.familySize}`}</p>
          </span>
          <span>
            <Icon variant='piggy-bank' {...iconDefaultProps} />
            <p>{`Average Income: ${profile.incomeRange}`}</p>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Demographics;
