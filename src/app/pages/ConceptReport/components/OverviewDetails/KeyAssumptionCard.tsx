import { FunctionComponent } from 'react';
import ConceptDetailCard from '../../../../components/Cards/ConceptDetailCard/ConceptDetailCard';
import styles from './overviewDetails.module.scss';
import { useOutletContext } from 'react-router-dom';
import { AppPath } from '../../../../../routes/routes';
import Icon from '../../../../components/Icons/Icon/Icon';
import GeneralBadge from '../../../../components/Badges/GeneralBadge/GeneralBadge';
import { IAssumption } from '../../../../../libs/api/types';
import { IConceptReportContext } from '../../ConceptReport';

const iconDefaultProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

export interface KeyAssumptionCardProps {
  keyAssumptions: IAssumption[];
}

const KeyAssumptionCard: FunctionComponent<KeyAssumptionCardProps> = ({ keyAssumptions }) => {
  const context = useOutletContext<IConceptReportContext>();

  return (
    <ConceptDetailCard
      title='Key Assumptions'
      subtitle='List of assumptions that require validation'
      cardClassName={styles.cardStyle}
      footerAction={
        <button
          className='btn btn-light'
          onClick={() => {
            context.navigateToTab(AppPath.ConceptKeyAssumptions);
          }}
          aria-label='View Assumptions'
        >
          <span>{<Icon variant='warning' {...iconDefaultProps} />}</span>
          View Key Assumptions
        </button>
      }
    >
      <div className={`${styles.cardContent} ${styles.noCardPadding}`}>
        <div className={styles.assumptionCard}>
          {keyAssumptions.map((assumption, i) => (
            <div key={`assumption-${assumption.uuid}-${i}`} className={styles.assumptionRow}>
              <div className={styles.badge}>
                <GeneralBadge variant={assumption.riskCategory} badgeText={assumption.riskCategory} />
              </div>
              {<div className={`${styles.descriptionText} ${styles.ellipsis}`}>{assumption.name}</div>}
            </div>
          ))}
        </div>
      </div>
    </ConceptDetailCard>
  );
};

export default KeyAssumptionCard;
