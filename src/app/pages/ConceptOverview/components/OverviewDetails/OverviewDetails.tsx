import { FunctionComponent } from 'react';
import styles from './styles/overviewDetails.module.scss';
import { useParams } from 'react-router-dom';
import ConceptCard from '../../../../components/ConceptCard';
import images from '../../../../assets/img';
import { IConcept } from '../../../../../libs/api/typings';

export interface OverviewDetailsProps {
  conceptData?: IConcept;
}

const OverviewDetails: FunctionComponent<OverviewDetailsProps> = ({ conceptData }) => {
  let { id } = useParams();

  return (
    <div className={styles.overviewDetails}>
      <div className={styles.summary}>
        <div className={styles.leftColumn}>
          <div className={styles.summaryBlock}>
            <h3>Value Proposition</h3>
            <div className={styles.textBlock}>
              <p>
                Serve the needs of the growing number of digital nomads, travellers, and expatriates who want to shop
                from Canadian businesses.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.detailBlock}>
            <h3>Overview</h3>
            <p>{conceptData?.description}</p>
            <div className={styles.overview}></div>
          </div>
          <div className={styles.listSection}>
            <div className={styles.detailBlock}>
              <h3>Signals</h3>
              <div className={styles.list}>
                <p>Remote Work</p>
                <p>Digital Nomads</p>
                <p>Snow Birds</p>
                <p>Snow Birds</p>
              </div>
            </div>
            <div className={styles.detailBlock}>
              <h3>Industries</h3>
              <div className={styles.list}>
                <p>Remote Work</p>
                <p>Digital Nomads</p>
                <p>Snow Birds</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODO remove Temporary card placeholders */}
      <div className={styles.cardContentContainer}>
        <ConceptCard
          title="Customer Profiles"
          subtitle="Breakdown of target user pain points and jobs to be done."
          width={360}
          buttonTitle="View Details"
          icon="userGroup"
          actionButtonProps={{
            disabled: !id,
            onClick: () => {
              if (!id) return;
            },
          }}
        >
          <div className={styles.cardContentWrapper}>
            <img alt="Customer Profile" src={images.customerProfile} />

            <div className={styles.cardContent}>
              <span className={styles.title}>Mostly Millennial and Hip profiles</span>
              <span className={styles.text}>
                The MVP has been targeted towards the millennials that spends the most time abroad
              </span>
            </div>
          </div>
        </ConceptCard>
        <ConceptCard
          title="Financial Projection"
          subtitle="Breakdown of business model canvas and hypotheses to validate."
          width={360}
          buttonTitle="Coming Soon"
          actionButtonProps={{
            disabled: true,
            'aria-disabled': true,
          }}
        >
          <img alt="Financial Projection" src={images.financialProjection} />
        </ConceptCard>
      </div>
    </div>
  );
};

export default OverviewDetails;
