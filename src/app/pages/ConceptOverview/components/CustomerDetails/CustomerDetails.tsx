import { FunctionComponent } from 'react';
import styles from './styles/customerDetails.module.scss';
import defaultAvatar from '../../../../assets/icons/avatar.svg';
import { IConcept } from '../../../../../libs/api/typings';
import Icon from '../../../../components/Icon';
import ConceptDetailCard from '../../../../components/ConceptDetailCard/ConceptDetailCard';

export interface CustomerDetailsProps {
  conceptData?: IConcept;
}

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

const CustomerDetails: FunctionComponent<CustomerDetailsProps> = ({ conceptData }) => {
  //TODO remove placeholder data with persona response
  return (
    <div className={styles.customerDetails}>
      <div className={styles.avatarSection}>
        <img className={styles.avatar} alt="avatar" src={defaultAvatar} />
        <div className={styles.avatarDetails} onClick={() => {}}>
          <span className={styles.description}>{'Global Students'}</span>
          <span className={styles.name}>{'Sarah Lim'}</span>
        </div>
      </div>
      <div className={styles.summary}>
        <div className={styles.leftColumn}>
          <div className={styles.detailBlock}>
            <h2>Overview</h2>
            <div className={styles.textBlock}>
              <p>{conceptData?.description}</p>
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
                  {`Geographic Location: ${'Ontario'}`}
                </p>
                <p>
                  <Icon variant="umbrella" {...iconDefaultProps} />
                  {`Age Range: ${'24 - 35'}`}
                </p>
                <p>
                  <Icon variant="userGroup" {...iconDefaultProps} />
                  {`Family Size(Lives with): ${'2'}`}
                </p>
                <p>
                  <Icon variant="piggyBank" {...iconDefaultProps} />
                  {`Average Income: ${'$40K - $75K'}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cardContainer}>
        <ConceptDetailCard title="Jobs to be Dones" icon="clipboard" isHideFooter>
          <div className={styles.cardContent}>
            <p className={styles.text}>Looking for sustainable products </p>
            <p className={styles.text}>Finding inspiration through browsing</p>
            <p className={styles.text}>Personalization</p>
            <p className={styles.text}>Purchase higher quality items</p>
          </div>
        </ConceptDetailCard>
        <ConceptDetailCard title="Pains" icon="userGroup" isHideFooter>
          <div className={styles.cardContent}>
            <p className={styles.text}>Long or complicated process </p>
            <p className={styles.text}>Hard to track budget</p>
            <p className={styles.text}>Forgetting to pay recurring bills </p>
          </div>
        </ConceptDetailCard>
        <ConceptDetailCard title="Quotes" icon="message" isHideFooter>
          <div className={styles.cardContent}>
            <p className={styles.text}>
              “I love browsing for inspiration, but my financials I want them straight to the point”{' '}
            </p>
            <p className={styles.text}>“I don't like recurring offers that really don't match my needs” </p>
            <p className={styles.text}>“It is hard to track my budget” </p>
            <p className={styles.text}>“I have spending goals of my own, but can't seem to hit them”</p>
            <p className={styles.text}>“I sometimes forget to pay my bills”</p>
          </div>
        </ConceptDetailCard>
      </div>
    </div>
  );
};

export default CustomerDetails;
