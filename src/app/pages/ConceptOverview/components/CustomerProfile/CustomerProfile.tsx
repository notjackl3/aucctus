import { FunctionComponent, useMemo, useState } from 'react';
import styles from './styles/customerProfile.module.scss';
import { ICustomerProfile } from '../../../../../libs/api/typings';
import Tabs from '../../../../components/Tabs';
import CustomerDetails from '../CustomerDetails';
import { TabElement } from '../../../../components/Tabs/Tabs';
import Loading from '../../../../components/Loading';

export interface CustomerProfileProps {
  conceptCustomerData: ICustomerProfile[];
  isConceptCustomerLoading: boolean;
}

const CustomerProfile: FunctionComponent<CustomerProfileProps> = ({
  conceptCustomerData,
  isConceptCustomerLoading,
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const customerList = conceptCustomerData || [];
  const emptyTabs: TabElement[] = [];

  const customerTabs = useMemo(() => {
    return customerList.reduce((acc: TabElement[], item: ICustomerProfile, index) => {
      acc.push({ label: item?.nickname || `Customer ${index + 1}` });
      return acc;
    }, emptyTabs);
  }, [customerList]);

  const renderCustomerProfiles = (customerList: ICustomerProfile[]) => {
    return customerList?.map((customer) => (
      <CustomerDetails key={`customer-profile-${customer.uuid}`} customerData={customer} />
    ));
  };

  return (
    <div className={styles.customerProfile}>
      {isConceptCustomerLoading ? (
        <Loading />
      ) : (
        <Tabs
          tabs={customerTabs}
          className={styles.tabs}
          activeTabIndex={activeTabIndex}
          selectActiveTab={setActiveTabIndex}
          isButtonStyle
        >
          {renderCustomerProfiles(customerList)}
        </Tabs>
      )}
    </div>
  );
};

export default CustomerProfile;
