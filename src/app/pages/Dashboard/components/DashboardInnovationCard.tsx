import { FunctionComponent, useMemo } from 'react';

import styles from '../styles/dashboard.module.scss';
import ConceptDetailCard from '../../../components/Cards/ConceptDetailCard/ConceptDetailCard';
import ConceptStatistic from '../../../components/Badges/ConceptStatistic';
import {
  ACTIVE_CONCEPT_STATUS_LIST,
  getDashboardConceptStatusIcon,
  getDashboardConceptStatusIconColor,
} from '../../../../libs/concepts';
import { ActiveConceptStatus, IConceptDetails } from '../../../../libs/api/types';

const ConceptTitle: Record<ActiveConceptStatus, string> = {
  prototyping: 'Concepts Generated',
  proofOfConcept: 'POCs Launched',
  minimumViableProduct: 'MVPs Launched',
  commercialized: 'Products Commercialized',
};

export interface DashboardInnovationCardProps {
  conceptCount: IConceptDetails['count'];
}

const DashboardInnovationCard: FunctionComponent<DashboardInnovationCardProps> = ({ conceptCount }) => {
  const innovationScores = useMemo(() => {
    if (!conceptCount) {
      return [];
    }
    return ACTIVE_CONCEPT_STATUS_LIST.map((status) => {
      return {
        infoTitle: ConceptTitle[status],
        infoValue: conceptCount[status],
        icon: getDashboardConceptStatusIcon(status),
        iconColor: getDashboardConceptStatusIconColor(status),
      };
    });
  }, [conceptCount]);

  const renderInnovationRows = innovationScores?.map((innovationRow, i) => (
    <div className={styles.cardRow} key={`innovation-score-${i}`}>
      <ConceptStatistic
        infoTitle={innovationRow.infoTitle}
        infoValue={`${innovationRow.infoValue}`}
        icon={innovationRow.icon}
        iconColor={innovationRow.iconColor}
      />
    </div>
  ));

  return (
    <ConceptDetailCard title='Innovation Scorecard' cardClassName={styles.cardStyle} isHideFooter>
      <div className={styles.cardContent}>{renderInnovationRows}</div>
    </ConceptDetailCard>
  );
};

export default DashboardInnovationCard;
