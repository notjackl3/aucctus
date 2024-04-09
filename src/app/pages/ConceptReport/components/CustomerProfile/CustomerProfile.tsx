import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import styles from './styles/customerProfile.module.scss';
import { ICustomerProfile } from '../../../../../libs/api/typings';
import TabView from '../../../../components/TabView';
import CustomerDetails from './CustomerDetails';
import Loading from '../../../../components/Loading';
import { useQuery } from 'react-query';
import api from '../../../../../libs/api';
import { useParams, useSearchParams } from 'react-router-dom';
import { TabElement } from '../../../../components/TabView/TabView';

const CustomerProfile: FunctionComponent = () => {
  const { id: conceptId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPersona = searchParams.get('persona');

  const { data, isLoading } = useQuery({
    queryKey: [`concept/${conceptId}/customer-profile`],
    retry: 1,
    queryFn: async () => await api.concept.getConceptCustomerProfiles(conceptId || ''),
  });

  const customerPersonas = useMemo(() => (data ? data.results : []), [data]);
  const firstPersona = customerPersonas.length > 0 ? customerPersonas[0] : undefined;

  const customerTabs = useMemo(() => {
    return customerPersonas.map<TabElement>((item: ICustomerProfile) => ({
      label: item.nickname,
      value: item.nickname,
    }));
  }, [customerPersonas]);

  const onTabSelect = useCallback((value: string) => {
    searchParams.set('persona', value);
    setSearchParams(searchParams);
  }, []);

  useEffect(() => {
    if (!selectedPersona && firstPersona) {
      searchParams.set('persona', firstPersona.nickname);
      setSearchParams(searchParams);
    }
  }, [selectedPersona, firstPersona, searchParams, setSearchParams]);

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
          defaultTab={firstPersona?.nickname || ''}
        >
          <>
            {customerPersonas.map((customer) => (
              <div key={`customer-profile-${customer.uuid}`}>
                {customer.nickname === selectedPersona ? <CustomerDetails customerData={customer} /> : null}
              </div>
            ))}
          </>
        </TabView>
      )}
    </div>
  );
};

export default CustomerProfile;
