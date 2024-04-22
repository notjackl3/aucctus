import { FunctionComponent, useMemo } from 'react';
import styles from './styles/customerDetails.module.scss';
import defaultAvatar from '../../../../assets/avatar.svg';
import { ICustomerProfile } from '../../../../../libs/api/typings';
import Icon from '../../../../components/Icon/Icon';
import ConceptDetailCard from '../../../../components/ConceptDetailCard/ConceptDetailCard';

export interface ICustomerDetailsProps {
  customerData: ICustomerProfile;
}

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

interface ICustomerDetailLists {
  title: string;
  icon: IconVariant;
  type: string;
  data: string[];
}

const CustomerDetails: FunctionComponent<ICustomerDetailsProps> = ({ customerData }) => {
  const listItems: ICustomerDetailLists[] = useMemo(() => {
    const jobContext: ICustomerDetailLists = {
      title: 'Jobs to be Done',
      icon: 'clipboard',
      type: 'jobs',
      data: customerData?.jobsToBeDone || [],
    };
    const pains: ICustomerDetailLists = {
      title: 'Pains',
      icon: 'user-group',
      type: 'pains',
      data: customerData?.pains || [],
    };

    const quotes: ICustomerDetailLists = {
      title: 'Quotes',
      icon: 'message-circle',
      type: 'quotes',
      data: customerData?.quotes || [],
    };

    return [jobContext, pains, quotes];
  }, [customerData]);

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
                  <Icon variant="user-group" {...iconDefaultProps} />
                  {`Family Size: ${customerData?.familySize}`}
                </p>
                <p>
                  <Icon variant="piggy-bank" {...iconDefaultProps} />
                  {`Average Income: ${customerData?.incomeRange}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cardContainer}>
        {listItems.map((item, index) => {
          return (
            <ConceptDetailCard
              cardClassName={styles.customerCards}
              title={item.title}
              key={`${item.title}-${index}`}
              icon={item.icon}
              isHideFooter
            >
              <div className={styles.cardContent}>
                {item.data.map((value, i) => (
                  <p key={`${item.title}-${item.icon}-${i}`} className={styles.text}>
                    {item.type === 'quotes' ? `"${value}"` : value}
                  </p>
                ))}
              </div>
            </ConceptDetailCard>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerDetails;
