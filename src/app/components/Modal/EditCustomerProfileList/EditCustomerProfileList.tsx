import { FunctionComponent, useCallback, useState } from 'react';

import styles from './edit-customer-profile-list.module.scss';
import { useConceptCustomerProfiles, useDeleteCustomerProfile } from '../../../hooks/query/concepts.hook';
import Icon from '../../Icons/Icon/Icon';
import { ICustomerProfile } from '../../../../libs/api/types';
import images from '../../../assets/img';
import { useModal } from '../../../context/modal/ModalContextProvider';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

interface IEditCustomerProfileListProps {
  conceptUuid: string;
}

const EditCustomerProfileList: FunctionComponent<IEditCustomerProfileListProps> = ({ conceptUuid }) => {
  const { closeModal } = useModal();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | undefined>(undefined);
  const { profiles } = useConceptCustomerProfiles(conceptUuid);
  const { mutate } = useDeleteCustomerProfile();
  const handleProfileDelete = useCallback((profileUuid: string) => {
    setShowConfirmation(true);
    setSelectedProfile(profileUuid);
  }, []);

  const closeConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setSelectedProfile(undefined);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div />
        <button aria-label="Close" className="btn-close" disabled={showConfirmation} onClick={() => closeModal()} />
      </div>
      <div className={styles.content}>
        {profiles.map((profile) => (
          <ProfileListItem
            key={profile.uuid}
            profile={profile}
            profileCount={profiles.length}
            onDelete={handleProfileDelete}
          />
        ))}

        <button className={styles.generate} disabled onClick={() => {}}>
          <Icon variant="plus" height={20} width={20} stroke="#000000" />
          Generate Persona
        </button>
      </div>
      <div className={styles.actions}>
        <button className="btn btn-primary" disabled={showConfirmation} onClick={() => closeModal()}>
          Done
        </button>
      </div>
      {showConfirmation ? (
        <div className={styles.confirm}>
          <ConfirmationModal
            title="Are you sure you'd like to delete?"
            subtitle="This action can not be reversed."
            actions={[
              {
                title: 'Cancel',
                variant: 'light',
                onClick: () => {
                  closeConfirmation();
                },
              },
              {
                title: 'Delete',
                variant: 'danger',
                onClick: () => {
                  if (!selectedProfile) return;
                  mutate(selectedProfile, {
                    onSuccess: () => {
                      closeConfirmation();
                    },
                  });
                },
              },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
};

const ProfileListItem: FunctionComponent<{
  profile: ICustomerProfile;
  profileCount: number;
  onDelete: (uuid: string) => void;
}> = ({ profile, profileCount, onDelete }) => {
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
        onClick={(e) => {
          onDelete(profile.uuid);
          e.preventDefault();
        }}
      >
        Remove
      </button>
    </div>
  );
};

export default EditCustomerProfileList;
