import TabView from '@components/Container/TabView';
import { TabElement } from '@components/Container/TabView/TabView';
import Loading from '@components/Loading';
import {
  useConceptCustomerProfiles,
  useDeleteCustomerProfile,
} from '@hooks/query/concepts.hook';
import { ICustomerProfile } from '@libs/api/types';
import { AppPath } from '@routes/routes';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CustomerDetails from './Details/CustomerDetails';
import styles from './customerProfile.module.scss';

import { Icon, Modal } from '@components';
import { useModal } from '@context/ModalContextProvider';
import utils from '@libs/utils';
import useStore from '@stores/store';

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
  const isHistoricalConceptVersion = useStore(
    (state) => state.conceptReport.isHistoricalVersion,
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
    if (
      (!selectedProfileName || !selectedProfile) &&
      conceptId &&
      firstPersona
    ) {
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
  }, [
    selectedProfileName,
    onTabSelect,
    conceptId,
    navigate,
    profiles,
    selectedProfile,
  ]);
  if (isLoading) {
    return (
      <div className='flex h-full w-full flex-col gap-6'>
        <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
          <Loading />
        </div>
      </div>
    );
  }

  // Handle case where loading is finished but no profiles exist
  if (!isLoading && profiles.length === 0) {
    return (
      <div className='aucctus-text-secondary flex h-full w-full flex-col items-center justify-center gap-6 p-8'>
        No customer profiles found for this concept.
        {/* Optionally add a button to create one? */}
      </div>
    );
  }

  return (
    <div className={styles.customerProfile}>
      <TabView
        tabs={customerTabs}
        tabGroupClassName='pointer-events-auto'
        className={styles.tabs}
        variant='button'
        onTabSelect={onTabSelect}
        activeTab={selectedProfileName || ''}
        actionButtons={
          isHistoricalConceptVersion
            ? []
            : [
                <button
                  key={utils.string.generateRandomString(5)}
                  className='btn btn-light'
                  disabled={!conceptId || !selectedProfile}
                  onClick={() => {
                    openModal(Modal.AddCustomerProfile, {
                      conceptUuid: conceptId || '',
                    });
                  }}
                >
                  <Icon variant='plus' height={20} width={20} />
                </button>,

                <button
                  key={utils.string.generateRandomString(5)}
                  className='btn btn-light'
                  disabled={!conceptId || !selectedProfile}
                  onClick={() => {
                    openModal(Modal.Confirmation, {
                      title: 'Are you sure?',
                      subtitle: `This will delete the \"${selectedProfileName}\" customer profile`,
                      actions: [
                        {
                          title: 'Cancel',
                          onClick: () => {
                            closeModal();
                          },
                          variant: 'light',
                        },
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
                      ],
                    });
                  }}
                >
                  <Icon variant='trash' height={20} width={20} />
                </button>,
              ]
        }
      >
        {selectedProfile ? (
          <CustomerDetails profile={selectedProfile} />
        ) : // Render nothing if no profile is selected after loading
        null}
      </TabView>
    </div>
  );
};

export default CustomerProfile;
