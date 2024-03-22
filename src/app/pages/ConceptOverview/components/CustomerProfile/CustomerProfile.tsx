import { FunctionComponent, useState } from 'react';
import styles from './styles/customerProfile.module.scss';
import { ICustomerProfile } from '../../../../../libs/api/typings';
import Tabs from '../../../../components/Tabs';
import CustomerDetails from '../CustomerDetails';
import { TabElement } from '../../../../components/Tabs/Tabs';
import Loading from '../../../../components/Loading';

export interface CustomerProfileProps {
  conceptCustomerData: any;
  isConceptCustomerLoading: boolean;
}

const CustomerProfile: FunctionComponent<CustomerProfileProps> = ({
  conceptCustomerData,
  isConceptCustomerLoading,
}) => {
  const customerList = conceptCustomerData?.results || [];
  const emptyTabs: TabElement[] = [];

  const getCustomerTabs = (customerList: ICustomerProfile[]) => {
    return customerList.reduce((acc: TabElement[], item: ICustomerProfile, index) => {
      acc.push({ label: item?.nickname || `Customer ${index + 1}` });
      return acc;
    }, emptyTabs);
  };

  const customerTabs = getCustomerTabs(customerList);

  const [activeTabIndex, setActiveTabIndex] = useState(0);

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
