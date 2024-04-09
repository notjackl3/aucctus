import { FunctionComponent } from 'react';
import ConceptDetailCard from '../../../../../components/ConceptDetailCard/ConceptDetailCard';
import styles from '../styles/overviewDetails.module.scss';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../../../../routes/routes';
import Icon from '../../../../../components/Icon';
import GeneralBadge from '../../../../../components/GeneralBadge';
import { IAssumption } from '../../../../../../libs/api/typings';

const iconDefaultProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

export interface KeyAssumptionCardProps {
  keyAssumptions: IAssumption[];
  conceptId: string;
}

const KeyAssumptionCard: FunctionComponent<KeyAssumptionCardProps> = ({ keyAssumptions, conceptId }) => {
  const navigate = useNavigate();

  return (
    <ConceptDetailCard
      title="Key Assumptions"
      subtitle="List of assumptions that require validation"
      cardClassName={styles.cardStyle}
      footerAction={
        <button
          className={styles.cardAction}
          onClick={() => {
            navigate(`${AppPath.ConceptKeyAssumptions.replace(':id', conceptId)}`);
          }}
          aria-label="View Assumptions"
        >
          <span>{<Icon variant="warning" {...iconDefaultProps} />}</span>
          View Key Assumptions
        </button>
      }
    >
      <div className={`${styles.cardContent} ${styles.noCardPadding}`}>
        <div className={`${styles.assumptionCard} ${styles.hiddenScroll}`}>
          {keyAssumptions.map((assumption, i) => (
            <div key={`assumption-${assumption.uuid}-${i}`} className={styles.assumptionRow}>
              <div className={styles.badge}>
                <GeneralBadge variant={`${assumption.riskCategory}Risk`} badgeText={assumption.riskCategory} />
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
