import { FunctionComponent } from 'react';

import styles from './edit-customer-profile-list.module.scss';
import { useConceptCustomerProfiles, useDeleteCustomerProfile } from '../../../hooks/query/concepts.hook';
import Icon from '../../Icons/Icon/Icon';
import { ICustomerProfile } from '../../../../libs/api/types';
import images from '../../../assets/img';
import { useModal } from '../../../context/modal/ModalContextProvider';

interface IEditCustomerProfileListProps {
  conceptUuid: string;
}

const EditCustomerProfileList: FunctionComponent<IEditCustomerProfileListProps> = ({ conceptUuid }) => {
  const { closeModal } = useModal();
  const { profiles } = useConceptCustomerProfiles(conceptUuid);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div />
        <button className={'btn-close'} onClick={() => closeModal()} />
      </div>
      <div className={styles.content}>
        {profiles.map((profile) => (
          <ProfileListItem key={profile.uuid} profile={profile} profileCount={profiles.length} />
        ))}

        <button className={styles.generate} disabled onClick={() => {}}>
          <Icon variant="plus" height={20} width={20} stroke="#000000" />
          Generate Persona
        </button>
      </div>
      <div className={styles.actions}>
        <button className="btn btn-primary" onClick={() => closeModal()}>
          Done
        </button>
      </div>
    </div>
  );
};

const ProfileListItem: FunctionComponent<{
  profile: ICustomerProfile;
  profileCount: number;
}> = ({ profile, profileCount }) => {
  const { mutate } = useDeleteCustomerProfile();

  return (
    <div className={styles.profile}>
      <div className={styles.details}>
        <img src={images.avatar} alt={profile.name} />
        <div className={styles.profileName}>
          <span>{profile.nickname}</span>
          <p>{profile.name}</p>
        </div>
      </div>
      <button
        disabled={profileCount === 1}
        className={styles.remove}
        onClick={() => {
          mutate(profile.uuid);
        }}
      >
        Remove
      </button>
    </div>
  );
};

export default EditCustomerProfileList;
