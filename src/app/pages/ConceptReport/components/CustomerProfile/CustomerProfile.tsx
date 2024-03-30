import { FunctionComponent, useState } from 'react';
import styles from './styles/customerProfile.module.scss';
import { ICustomerProfile } from '../../../../../libs/api/typings';
import TabView from '../../../../components/TabView';
import CustomerDetails from '../CustomerDetails';
import { TabElement } from '../../../../components/TabView/TabView';
import Loading from '../../../../components/Loading';
import { useQuery } from 'react-query';
import api from '../../../../../libs/api';
import { useParams } from 'react-router-dom';

const CustomerProfile: FunctionComponent = () => {
  const { id: conceptId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: [`concept/${conceptId}/customer-profile`],
    retry: 1,
    queryFn: async () => await api.concept.getConceptCustomerProfiles(conceptId || ''),
  });

  const conceptCustomerData = data ? data.results : [];

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const customerList = conceptCustomerData;
  const emptyTabs: TabElement[] = [];

  const getCustomerTabs = (customerList: ICustomerProfile[]) => {
    return customerList.reduce((acc: TabElement[], item: ICustomerProfile, index) => {
      acc.push({ label: item.nickname || `Customer ${index + 1}` });
      return acc;
    }, emptyTabs);
  };

  const customerTabs = getCustomerTabs(customerList);

  const renderCustomerProfiles = (customerList: ICustomerProfile[]) => {
    return customerList?.map((customer) => (
      <CustomerDetails key={`customer-profile-${customer.uuid}`} customerData={customer} />
    ));
  };

  return (
    <div className={styles.customerProfile}>
      {isLoading ? (
        <Loading />
      ) : (
        <TabView
          tabs={customerTabs}
          className={styles.tabs}
          activeTabIndex={activeTabIndex}
          selectActiveTab={setActiveTabIndex}
          isButtonStyle
        >
          <>{renderCustomerProfiles(customerList)}</>
        </TabView>
      )}
    </div>
  );
};

export default CustomerProfile;
