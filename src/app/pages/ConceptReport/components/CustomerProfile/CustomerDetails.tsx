import { FunctionComponent } from 'react';
import styles from './styles/customerDetails.module.scss';
import defaultAvatar from '../../../../assets/avatar.svg';
import { ICustomerProfile } from '../../../../../libs/api/types';
import CustomerProfileContextList from '../../../../components/Concepts/CustomerProfiles/CustomerProfileContextList/CustomerProfileContextList';
import DemographicsContainer from '../../../../components/Concepts/CustomerProfiles/DemographicsContainer/DemographicsContainer';
import EditModeSwitcher from '../../../../components/Text/EditibleTextView/EditibleTextView';
import { useEditCustomerProfile } from '../../../../hooks/concepts/editable.hook';

export interface ICustomerDetailsProps {
  profile: ICustomerProfile;
}

const CustomerDetails: FunctionComponent<ICustomerDetailsProps> = ({ profile }) => {
  const { description } = useEditCustomerProfile(profile.uuid);

  return (
    <div className={styles.customerDetails}>
      <div className={styles.avatarSection}>
        <img className={styles.avatar} alt='avatar' src={defaultAvatar} />
        <div className={styles.avatarDetails}>
          <span className={styles.description}>{profile?.nickname}</span>
          <span className={styles.name}>{profile?.name}</span>
        </div>
      </div>
      <div className={styles.summary}>
        <div className={styles.leftColumn}>
          <div className={styles.detailBlock}>
            <h2>Overview</h2>
            <EditModeSwitcher
              containerClassName={styles.textBlock}
              name='description'
              value={description.value}
              onChange={description.handleChange}
              handleSave={description.handleSave}
              handleCancel={description.handleCancel}
            />
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.listSection}>
            <DemographicsContainer profile={profile} canEdit={true} />
          </div>
        </div>
      </div>

      <div className={styles.cardContainer}>
        <CustomerProfileContextList
          profileUuid={profile.uuid}
          title={'Jobs to be Done'}
          icon={'clipboard'}
          field={'jobs'}
          data={profile.jobs}
        />
        <CustomerProfileContextList
          profileUuid={profile.uuid}
          title={'Pains'}
          icon={'user-group'}
          field={'pains'}
          data={profile.pains}
        />
        <CustomerProfileContextList
          profileUuid={profile.uuid}
          title={'Quotes'}
          icon={'message-circle'}
          field={'quotes'}
          data={profile.quotes}
        />
      </div>
    </div>
  );
};

export default CustomerDetails;
