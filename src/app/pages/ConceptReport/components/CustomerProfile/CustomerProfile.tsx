import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import styles from './styles/customerProfile.module.scss';
import { ICustomerProfile } from '../../../../../libs/api/types';
import TabView from '../../../../components/Container/TabView';
import CustomerDetails from './CustomerDetails';
import Loading from '../../../../components/Loading';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { TabElement } from '../../../../components/Container/TabView/TabView';
import { AppPath } from '../../../../../routes/routes';
import { useConceptCustomerProfiles, useDeleteCustomerProfile } from '../../../../hooks/query/concepts.hook';
import Icon from '../../../../components/Icons/Icon/Icon';
import { useModal } from '../../../../context/modal/ModalContextProvider';
import AddCustomerProfile from '../../../../components/Modal/CustomerProfile/AddCustomerProfile';
import ConfirmationModal from '../../../../components/Modal/ConfirmationModal/ConfirmationModal';

const CustomerProfile: FunctionComponent = () => {
  const { id: conceptId } = useParams();
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const { profiles, isLoading } = useConceptCustomerProfiles(conceptId || '');
  const { mutate } = useDeleteCustomerProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProfileName = searchParams.get('persona');
  const selectedProfile = useMemo(
    () => profiles.find((item) => item.nickname === selectedProfileName),
    [profiles, selectedProfileName],
  );

  const customerTabs = useMemo(() => {
    return profiles.map<TabElement>((item: ICustomerProfile) => ({
      label: item.nickname,
      value: item.nickname,
    }));
  }, [profiles]);

  const onTabSelect = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        prev.set('persona', value);
        return prev;
      });
    },
    [setSearchParams],
  );

  useEffect(() => {
    const firstPersona = profiles.length > 0 ? profiles[0] : undefined;
    if ((!selectedProfileName || !selectedProfile) && conceptId && firstPersona) {
      navigate(
        {
          pathname: AppPath.ConceptCustomerProfile.replace(':id', conceptId),
          search: `?persona=${firstPersona.nickname}`,
        },
        {
          replace: true,
        },
      );
    }
  }, [selectedProfileName, onTabSelect, conceptId, navigate, profiles, selectedProfile]);

  return (
    <div className={styles.customerProfile}>
      {isLoading ? (
        <Loading />
      ) : (
        <TabView
          tabs={customerTabs}
          className={styles.tabs}
          variant='button'
          onTabSelect={onTabSelect}
          activeTab={selectedProfileName || ''}
          actionButtons={[
            <button
              className='btn btn-light'
              disabled={!conceptId || !selectedProfile}
              onClick={() => {
                openModal(AddCustomerProfile, { conceptUuid: conceptId || '' });
              }}
            >
              <Icon variant='plus' height={20} width={20} />
            </button>,

            <button
              className='btn btn-light'
              disabled={!conceptId || !selectedProfile}
              onClick={() => {
                openModal(ConfirmationModal, {
                  title: 'Are you sure?',
                  subtitle: `This will delete the \"${selectedProfileName}\" customer profile`,
                  actions: [
                    {
                      title: 'Delete',
                      variant: 'danger',
                      onClick: () => {
                        if (selectedProfile) {
                          mutate(selectedProfile.uuid);
                        }
                        closeModal();
                      },
                    },
                    {
                      title: 'Cancel',
                      onClick: () => {
                        closeModal();
                      },
                      variant: 'primary',
                    },
                  ],
                });
              }}
            >
              <Icon variant='trash' height={20} width={20} />
            </button>,
          ]}
        >
          {selectedProfile ? <CustomerDetails profile={selectedProfile} /> : <Loading />}
        </TabView>
      )}
    </div>
  );
};

export default CustomerProfile;
