import React from 'react';
import {
  ConceptReportSkeletons,
  VersionUpgradeBanner,
  toast,
} from '@components';
import ExecutiveSummaryBanner from '@components/ConceptOverview/ExecutiveSummaryBanner';
import Ecosystem from './MarketScan/ecosystem/Ecosystem';
import useStore from '@stores/store';
import {
  useConceptExecutiveSummaries,
  useGenerateEcosystemV2,
} from '@hooks/query/concepts.hook';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { useConceptReportContext } from './ConceptReport/ConceptReportContext';

const { ExecutiveSummarySkeleton, EcosystemV2Skeleton } =
  ConceptReportSkeletons;

const EcosystemWrapper: React.FC = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );
  const { concept, isReadOnly } = useConceptReportContext();
  const isDebugModeEnabled = useDebugMode();

  const executiveSummariesQuery = useConceptExecutiveSummaries(
    activeConceptUuid || '',
  );
  const { executiveSummaries } = executiveSummariesQuery;

  const { mutate: generateEcosystem, isLoading: isGeneratingEcosystem } =
    useGenerateEcosystemV2();

  const isEcosystemSectionPending =
    concept?.reportStatusBySection?.ecosystem?.status === 'pending';
  const showExecutiveSummarySkeleton =
    executiveSummariesQuery.isLoading && !executiveSummaries;

  const handleDebugModeGenerate = () => {
    generateEcosystem(concept.identifier, {
      onError: () => {
        toast.error('Ecosystem Failed', 'Failed to generate Ecosystem');
      },
    });
  };

  if (!activeConceptUuid) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='aucctus-text-secondary'>No concept selected</p>
      </div>
    );
  }

  if (isEcosystemSectionPending) {
    return (
      <div className='mx-auto flex max-w-[1600px] flex-col gap-8 p-4'>
        <ExecutiveSummarySkeleton />
        <EcosystemV2Skeleton />
      </div>
    );
  }

  return (
    <div
      data-section-id='market_scan_ecosystem'
      className='flex flex-1 flex-col gap-4'
    >
      {!isReadOnly && isDebugModeEnabled && (
        <VersionUpgradeBanner
          onUpgrade={handleDebugModeGenerate}
          isLoading={isGeneratingEcosystem}
          buttonText='Generate Ecosystem'
          debugMode={true}
        />
      )}
      <div className='mx-auto flex max-w-[1600px] flex-col gap-8 p-4'>
        <div className='w-full'>
          {showExecutiveSummarySkeleton ? (
            <ExecutiveSummarySkeleton />
          ) : (
            <ExecutiveSummaryBanner
              summary={executiveSummaries?.marketScanEcosystem}
              isLoading={false}
            />
          )}
        </div>
        <Ecosystem />
      </div>
    </div>
  );
};

export default EcosystemWrapper;
