import { FunctionComponent } from 'react';
import styles from './styles/customerProfile.module.scss';
import { IConcept } from '../../../../../libs/api/typings';
import Tabs from '../../../../components/Tabs';
import CustomerDetails from '../CustomerDetails';

export interface CustomerProfileProps {
  conceptData?: IConcept;
}

const CustomerProfile: FunctionComponent<CustomerProfileProps> = ({ conceptData }) => {
  //TODO remove temporary Personas
  const tabs = [{ label: 'Persona 1' }, { label: 'Persona 2' }, { label: 'Persona 3' }];

  return (
    <div className={styles.customerProfile}>
      <Tabs tabs={tabs} className={styles.tabs} isButtonStyle>
        <CustomerDetails conceptData={conceptData} />
      </Tabs>
    </div>
  );
};

export default CustomerProfile;
