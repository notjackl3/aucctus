import { FunctionComponent, useState } from 'react';
import styles from './styles/conceptOverview.module.scss';
import Icon from '../../components/Icon';
import Tabs from '../../components/Tabs';
import OverviewDetails from './components/OverviewDetails';
import Dropdown from '../../components/Dropdown/Dropdown';
import useConceptOverview from './hooks/useConceptOverview';
import CustomerProfile from './components/CustomerProfile';
import FinancialDetails from './components/FinancialDetails';
import MarketDetails from './components/MarketDetails/MarketDetails';
import HypothesisDetails from './components/HypothesisDetails';

export interface ConceptOverviewProps {
  closePage: () => void;
  conceptId: string;
}

const ConceptOverview: FunctionComponent<ConceptOverviewProps> = ({ closePage, conceptId }) => {
  const {
    tabs,
    options,
    conceptData,
    conceptOverviewData,
    isConceptOverviewLoading,
    conceptCustomerData,
    isConceptCustomerLoading,
    changeConceptStatus,
    initialOption,
  } = useConceptOverview(conceptId);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  return (
    <div className={`${styles.conceptOverview} ${styles.slideAnimation}`}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <h1>{conceptData?.title}</h1>
          <div className={styles.statusSelect}>
            {!!conceptData?.status && (
              <Dropdown options={options} onSelect={changeConceptStatus} initialOption={initialOption} />
            )}
          </div>
        </div>
        <div className={styles.actions}>
          <button aria-label="Close Detail Page" className={`${styles.closeButton}`} onClick={closePage}>
            <Icon variant="closeX" height={20} width={20} stroke="#fff" />
          </button>
        </div>
      </div>
      <div className={styles.contentContainer}>
        <Tabs className={styles.tabs} tabs={tabs} activeTabIndex={activeTabIndex} selectActiveTab={setActiveTabIndex}>
          <OverviewDetails
            conceptData={conceptData}
            isConceptOverviewLoading={isConceptOverviewLoading}
            conceptOverviewData={conceptOverviewData}
            selectActiveTab={setActiveTabIndex}
          />
          <MarketDetails conceptData={conceptData} />
          <FinancialDetails conceptData={conceptData} />
          <CustomerProfile
            isConceptCustomerLoading={isConceptCustomerLoading}
            conceptCustomerData={conceptCustomerData}
          />
          <HypothesisDetails conceptData={conceptData} />
          <div>Key Assumptions</div>
        </Tabs>
      </div>
    </div>
  );
};

export default ConceptOverview;
