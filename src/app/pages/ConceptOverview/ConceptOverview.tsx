import { FunctionComponent } from 'react';
import styles from './styles/conceptOverview.module.scss';
import Icon from '../../components/Icon';
import Tabs from '../../components/Tabs';
import Dropdown from '../../components/Dropdown/Dropdown';
import useConceptOverview from './hooks/useConceptOverview';
import { Outlet, useParams } from 'react-router-dom';

const ConceptOverview: FunctionComponent = () => {
  const { id: conceptId } = useParams();

  const {
    tabs,
    options,
    conceptData,
    changeConceptStatus,
    initialOption,
    activeTabIndex,
    navigateConceptTab,
    closePage,
  } = useConceptOverview(conceptId ? conceptId : '');

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
        <Tabs
          className={styles.tabs}
          tabs={tabs}
          activeTabIndex={activeTabIndex}
          selectActiveTab={navigateConceptTab}
        />
        <Outlet />
      </div>
    </div>
  );
};

export default ConceptOverview;
