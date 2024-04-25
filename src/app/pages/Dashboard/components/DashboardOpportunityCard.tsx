import { FunctionComponent, useMemo, useState } from 'react';

import styles from '../styles/dashboard.module.scss';
import ConceptDetailCard from '../../../components/Cards/ConceptDetailCard/ConceptDetailCard';
import ConceptStatistic from '../../../components/Badges/ConceptStatistic';
import { camelCaseToTitleCase, formatter } from '../../../../libs/utils';
import {
  ACTIVE_CONCEPT_STATUS_LIST,
  ConceptStatusIconColor,
  getDashboardConceptStatusIcon,
  getDashboardConceptStatusIconColor,
} from '../../../../libs/concepts';
import { ActiveConceptStatus, IConceptDetails } from '../../../../libs/api/types';
import { IConceptStatisticProps } from '../../../components/Badges/ConceptStatistic/ConceptStatistic';

export interface OpportunityData {
  infoTitle: string;
  conceptCount: number;
  status: ActiveConceptStatus;
  somValue: number;
  infoValue: string;
  infoSubValue: string;
  icon: IconVariant;
  iconColor: ConceptStatusIconColor;
  variant?: IConceptStatisticProps['variant'];
}

export interface DashboardOpportunityCardProps {
  conceptDetails: IConceptDetails;
}

const DashboardOpportunityCard: FunctionComponent<DashboardOpportunityCardProps> = ({ conceptDetails }) => {
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);

  const opportunityData: OpportunityData[] = useMemo(() => {
    if (!conceptDetails) {
      return [];
    }
    return ACTIVE_CONCEPT_STATUS_LIST.map((status) => {
      const somValue = conceptDetails.som[status];
      const conceptCount = conceptDetails.count[status];
      return {
        status: status,
        infoTitle: camelCaseToTitleCase(status),
        icon: getDashboardConceptStatusIcon(status),
        somValue: somValue,
        infoValue: formatter.format(somValue),
        iconColor: getDashboardConceptStatusIconColor(status),
        variant: 'opportunity',
        conceptCount: conceptCount,
        infoSubValue: `${conceptCount} concepts`,
      };
    });
  }, [conceptDetails]);

  function calculateTotalValues(opportunityData: OpportunityData[]) {
    const baseSumObj = { totalSomValue: 0, totalConceptCount: 0 };
    if (!opportunityData) {
      return baseSumObj;
    }
    return opportunityData.reduce((acc, opportunity) => {
      if (opportunity && selectedOpportunities.includes(opportunity.status)) {
        acc.totalSomValue += opportunity.somValue || 0;
        acc.totalConceptCount += opportunity.conceptCount || 0;
        return acc;
      } else {
        return acc;
      }
    }, baseSumObj);
  }

  const summationObj = calculateTotalValues(opportunityData);

  const addStatusKey = (statusKey: string) => {
    const selectedSet = new Set(selectedOpportunities);
    selectedSet.add(statusKey);
    setSelectedOpportunities(Array.from(selectedSet));
  };

  const removeStatusKey = (statusKey: string) => {
    const selectedSet = new Set(selectedOpportunities);
    selectedSet.delete(statusKey);
    setSelectedOpportunities(Array.from(selectedSet));
  };
  const toggleSelectedStatus = (statusKey: string) => {
    if (selectedOpportunities.includes(statusKey)) {
      removeStatusKey(statusKey);
    } else {
      addStatusKey(statusKey);
    }
  };

  const renderOpportunityRows = opportunityData?.map((opportunity, i) => (
    <div className={styles.cardRow} key={`opportunity-${i}`}>
      <ConceptStatistic
        infoTitle={opportunity.infoTitle}
        infoValue={opportunity.infoValue}
        infoSubValue={opportunity.infoSubValue}
        icon={opportunity.icon}
        iconColor={opportunity.iconColor}
        variant={opportunity.variant}
      />
      <input
        type="checkbox"
        checked={selectedOpportunities.includes(opportunity.status)}
        onChange={() => toggleSelectedStatus(opportunity.status)}
      />
    </div>
  ));

  return (
    <ConceptDetailCard
      title="Potential Opportunity Size"
      cardClassName={styles.cardStyle}
      footerAction={
        <div className={styles.opportunityFooter}>
          <ConceptStatistic
            infoTitle="Total Potential Opportunity"
            infoValue={formatter.format(summationObj.totalSomValue)}
            infoSubValue={`${summationObj.totalConceptCount} concepts`}
            icon="shield-dollar"
            iconColor="purple"
          />
        </div>
      }
    >
      <div className={styles.cardContent}>{renderOpportunityRows}</div>
    </ConceptDetailCard>
  );
};

export default DashboardOpportunityCard;
