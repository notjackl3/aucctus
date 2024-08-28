import { FunctionComponent, useMemo, useState } from 'react';

import utils from '@libs/utils';
import styles from '../styles/dashboard.module.scss';

import { Badge, Card } from '@components';
import { IConceptStatisticProps } from '@components/Badges/ConceptStatistic/ConceptStatistic';
import { ActiveConceptStatus, IConceptDetails } from '@libs/api/types';
import { ConceptStatusIconColor } from '@libs/utils/concepts';

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

const DashboardOpportunityCard: FunctionComponent<
  DashboardOpportunityCardProps
> = ({ conceptDetails }) => {
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>(
    [],
  );

  const opportunityData: OpportunityData[] = useMemo(() => {
    if (!conceptDetails) {
      return [];
    }
    return utils.concepts.ACTIVE_CONCEPT_STATUS_LIST.map((status) => {
      const somValue = conceptDetails.som[status];
      const conceptCount = conceptDetails.count[status];
      return {
        status: status,
        infoTitle: utils.string.camelCaseToTitleCase(status),
        icon: utils.concepts.getDashboardConceptStatusIcon(status),
        somValue: somValue,
        infoValue: utils.number.formatter.format(somValue),
        iconColor: utils.concepts.getDashboardConceptStatusIconColor(status),
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
      <Badge.ConceptStatistic
        infoTitle={opportunity.infoTitle}
        infoValue={opportunity.infoValue}
        infoSubValue={opportunity.infoSubValue}
        icon={opportunity.icon}
        iconColor={opportunity.iconColor}
        variant={opportunity.variant}
      />
      <input
        type='checkbox'
        checked={selectedOpportunities.includes(opportunity.status)}
        onChange={() => toggleSelectedStatus(opportunity.status)}
      />
    </div>
  ));

  return (
    <Card.Detail
      title='Potential Opportunity Size'
      cardClassName={styles.cardStyle}
      footerAction={
        <div className={styles.opportunityFooter}>
          <Badge.ConceptStatistic
            infoTitle='Total Potential Opportunity'
            infoValue={utils.number.formatter.format(
              summationObj.totalSomValue,
            )}
            infoSubValue={`${summationObj.totalConceptCount} concepts`}
            icon='shield-dollar'
            iconColor='purple'
          />
        </div>
      }
    >
      <div className={styles.cardContent}>{renderOpportunityRows}</div>
    </Card.Detail>
  );
};

export default DashboardOpportunityCard;
