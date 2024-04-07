import { FunctionComponent, useState } from 'react';

import styles from '../styles/dashboard.module.scss';
import ConceptDetailCard from '../../../components/ConceptDetailCard/ConceptDetailCard';
import ConceptStatistic from '../../../components/ConceptStatistic';
import { formatLargeNumber } from '../../../../libs/utils';
import { IconVariant } from '../../../components/Icon';
import { ConceptStatusIconColor } from '../../../../libs/concepts';

export interface OpportunityData {
  infoTitle: string;
  conceptCount: number;
  somValue: number;
  infoValue: number;
  infoSubValue: string;
  icon: IconVariant;
  iconColor: ConceptStatusIconColor;
  variant: string;
}

export interface DashboardOpportunityCardProps {
  opportunityData?: OpportunityData[];
}

// TODO Remove this temporary data once the API is available
const OPP_DATA_TEMP: any = {
  prototype: {
    infoTitle: 'Prototypes',
    conceptCount: 30,
    somValue: 500000,
    infoValue: formatLargeNumber(500000),
    infoSubValue: '30 concepts',
    icon: 'lightbulb',
    iconColor: 'lightblue',
    variant: 'opportunity',
  },
  proofOfConcept: {
    infoTitle: 'Proof of Concepts',
    status: 'prototyping',
    somValue: 500000,
    infoValue: formatLargeNumber(500000),
    conceptCount: 10,
    infoSubValue: '10 concepts',
    icon: 'paperAirPlane',
    iconColor: 'blue',
    variant: 'opportunity',
  },
  commercialized: {
    infoTitle: 'Products Commercialized',
    somValue: 2300000,
    infoValue: formatLargeNumber(2300000),
    conceptCount: 30,
    infoSubValue: '30 concepts',
    icon: 'rocket',
    iconColor: 'blue',
    variant: 'opportunity',
  },
  minimumViableProduct: {
    infoTitle: 'Minimum Viable Products',
    somValue: 5000030,
    infoValue: formatLargeNumber(5000030),
    conceptCount: 30,
    infoSubValue: '30 concepts',
    icon: 'shieldDollar',
    iconColor: 'purple',
    variant: 'opportunity',
  },
};

const DashboardOpportunityCard: FunctionComponent<DashboardOpportunityCardProps> = ({
  opportunityData = OPP_DATA_TEMP,
}) => {
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);

  function calculateTotalValues(opportunityData: OpportunityData) {
    const baseSumObj = { totalSomValue: 0, totalConceptCount: 0 };
    if (!opportunityData) {
      return baseSumObj;
    }
    return Object.entries(opportunityData).reduce((acc, [statusKey, opportunity]) => {
      if (selectedOpportunities.includes(statusKey) && opportunity) {
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

  const renderOpportunityRows = Object.entries(opportunityData)?.map(([statusKey, opportunity]: any) => (
    <div className={styles.cardRow}>
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
        checked={selectedOpportunities.includes(statusKey)}
        onChange={() => toggleSelectedStatus(statusKey)}
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
            infoValue={formatLargeNumber(summationObj.totalSomValue)}
            infoSubValue={`${summationObj.totalConceptCount} concepts`}
            icon="shieldDollar"
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
