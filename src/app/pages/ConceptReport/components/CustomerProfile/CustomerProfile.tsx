import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import styles from './styles/customerProfile.module.scss';
import { ICustomerProfile } from '../../../../../libs/api/types';
import TabView from '../../../../components/Container/TabView';
import CustomerDetails from './CustomerDetails';
import Loading from '../../../../components/Loading';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { TabElement } from '../../../../components/Container/TabView/TabView';
import { AppPath } from '../../../../../routes/routes';
import { useConceptCustomerProfiles } from '../../../../hooks/query/concepts.hook';
import Icon from '../../../../components/Icons/Icon/Icon';
import { useModal } from '../../../../context/modal/ModalContextProvider';
import EditCustomerProfileList from '../../../../components/Modal/EditCustomerProfileList/EditCustomerProfileList';

const CustomerProfile: FunctionComponent = () => {
  const { id: conceptId } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { profiles, isLoading } = useConceptCustomerProfiles(conceptId || '');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProfileName = searchParams.get('persona');
  const selectedProfile = useMemo(
    () => profiles.find((item) => item.nickname === selectedProfileName),
    [profiles, selectedProfileName]
  );

  const firstPersona = profiles.length > 0 ? profiles[0] : undefined;

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
    [setSearchParams]
  );

  useEffect(() => {
    if (!selectedProfileName && conceptId && firstPersona) {
      navigate(
        {
          pathname: AppPath.ConceptCustomerProfile.replace(':id', conceptId),
          search: `?persona=${firstPersona.nickname}`,
        },
        {
          replace: true,
        }
      );
    }
  }, [selectedProfileName, firstPersona, onTabSelect, conceptId, navigate]);

  return (
    <div className={styles.customerProfile}>
      {isLoading ? (
        <Loading />
      ) : (
        <TabView
          tabs={customerTabs}
          className={styles.tabs}
          variant="button"
          onTabSelect={onTabSelect}
          activeTab={selectedProfileName || ''}
          actionButtons={
            <button
              className="btn btn-light"
              onClick={() => {
                openModal(EditCustomerProfileList, { conceptUuid: conceptId || '' });
              }}
            >
              <Icon variant="users-edit" height={20} width={20} />
            </button>
          }
        >
          {selectedProfile ? <CustomerDetails profile={selectedProfile} /> : <Loading />}
        </TabView>
      )}
    </div>
  );
};

export default CustomerProfile;
