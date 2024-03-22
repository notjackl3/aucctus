import { FunctionComponent } from 'react';
import styles from './styles/customerDetails.module.scss';
import defaultAvatar from '../../../../assets/icons/avatar.svg';
import { ICustomerProfile } from '../../../../../libs/api/typings';
import Icon from '../../../../components/Icon';
import ConceptDetailCard from '../../../../components/ConceptDetailCard/ConceptDetailCard';

export interface CustomerDetailsProps {
  customerData: ICustomerProfile;
}

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

const CustomerDetails: FunctionComponent<CustomerDetailsProps> = ({ customerData }) => {
  const renderJobs = (jobList: string[] = []) => {
    return jobList.map((job, index) => (
      <p key={`jobs-${index}`} className={styles.text}>
        {job}
      </p>
    ));
  };
  const renderPains = (painsList: string[] = []) => {
    return painsList.map((pain, index) => (
      <p key={`pains-${index}`} className={styles.text}>
        {pain}
      </p>
    ));
  };
  const renderQuotes = (quotesList: string[] = []) => {
    return quotesList.map((quote, index) => (
      <p key={`pains-${index}`} className={styles.text}>
        {quote}
      </p>
    ));
  };

  return (
    <div className={styles.customerDetails}>
      <div className={styles.avatarSection}>
        <img className={styles.avatar} alt="avatar" src={defaultAvatar} />
        <div className={styles.avatarDetails} onClick={() => {}}>
          <span className={styles.description}>{customerData?.nickname}</span>
          <span className={styles.name}>{customerData?.name}</span>
        </div>
      </div>
      <div className={styles.summary}>
        <div className={styles.leftColumn}>
          <div className={styles.detailBlock}>
            <h2>Overview</h2>
            <div className={styles.textBlock}>
              <p>{customerData?.description}</p>
            </div>
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.listSection}>
            <div className={styles.detailBlock}>
              <h2>Demographics</h2>
              <div className={styles.list}>
                <p>
                  <Icon variant="globe" {...iconDefaultProps} />
                  {`Geographic Location: ${customerData?.geoLocation}`}
                </p>
                <p>
                  <Icon variant="umbrella" {...iconDefaultProps} />
                  {`Age Range: ${customerData?.ageRange}`}
                </p>
                <p>
                  <Icon variant="userGroup" {...iconDefaultProps} />
                  {`Family Size(Lives with): ${customerData?.familySize}`}
                </p>
                <p>
                  <Icon variant="piggyBank" {...iconDefaultProps} />
                  {`Average Income: ${customerData?.incomeRange}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cardContainer}>
        <ConceptDetailCard title="Jobs to be Dones" icon="clipboard" isHideFooter>
          <div className={styles.cardContent}>{renderJobs(customerData?.jobsToBeDone)}</div>
        </ConceptDetailCard>
        <ConceptDetailCard title="Pains" icon="userGroup" isHideFooter>
          <div className={styles.cardContent}>{renderPains(customerData?.pains)}</div>
        </ConceptDetailCard>
        <ConceptDetailCard title="Quotes" icon="message" isHideFooter>
          <div className={styles.cardContent}>{renderQuotes(customerData?.quotes)}</div>
        </ConceptDetailCard>
      </div>
    </div>
  );
};

export default CustomerDetails;
