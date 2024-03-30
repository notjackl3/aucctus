import { FunctionComponent, useMemo } from 'react';
import styles from './styles/customerDetails.module.scss';
import defaultAvatar from '../../../../assets/icons/avatar.svg';
import { ICustomerProfile } from '../../../../../libs/api/typings';
import Icon, { IconVariant } from '../../../../components/Icon';
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
  data: string[];
}

const CustomerDetails: FunctionComponent<ICustomerDetailsProps> = ({ customerData }) => {
  const listItems: ICustomerDetailLists[] = useMemo(() => {
    return [
      {
        title: 'Jobs to be Done',
        icon: 'clipboard',
        data: customerData?.jobsToBeDone || [],
      },
      {
        title: 'Pains',
        icon: 'userGroup',
        data: customerData?.pains || [],
      },
      {
        title: 'Quotes',
        icon: 'message',
        data: customerData?.quotes || [],
      },
    ];
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
                  <Icon variant="userGroup" {...iconDefaultProps} />
                  {`Family Size: ${customerData?.familySize}`}
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
        {listItems.map((item, index) => {
          return (
            <ConceptDetailCard title={item.title} key={`${item.title}-${index}`} icon={item.icon} isHideFooter>
              <div className={styles.cardContent}>
                {item.data.map((value, i) => (
                  <p key={`${item.title}-${item.icon}-${i}`} className={styles.text}>
                    {value}
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
