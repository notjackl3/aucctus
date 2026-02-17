import React, { useEffect, useState } from 'react';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useEditMarketScan } from '@hooks/concepts/editable.hook';
import {
  useConceptMarketScan,
  useGenerateEcosystemV2,
} from '@hooks/query/concepts.hook';
import IncumbentsList from '../components/Incumbent-list/IncumbentList';
import StartupList from '../components/startup-list/StartupList';
import useStore from '@stores/store';
import {
  EcosystemV2,
  VersionUpgradeBanner,
  ConceptReportSkeletons,
} from '@components';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from '../../ConceptReport/ConceptReport';
import { useEcosystem } from '@components/EcosystemV2/hooks/useEcosystem';

const { EcosystemV2Skeleton } = ConceptReportSkeletons;

const Ecosystem: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid ?? '',
  );
  const { data: marketScan } = useConceptMarketScan(activeConceptUuid);
  const { ecosystemDescription } = useEditMarketScan();
  const { mutate: generateEcosystem, isLoading: isUpgrading } =
    useGenerateEcosystemV2();
  const [isAwaitingEcosystemUpgrade, setIsAwaitingEcosystemUpgrade] =
    useState(false);

  // Check if concept has been upgraded to ecosystem v2
  const featureVersion = concept.featureVersions?.ecosystem || 'v1';
  const shouldRenderV2 = featureVersion === 'v2';

  const shouldFetchEcosystem =
    (shouldRenderV2 || isAwaitingEcosystemUpgrade) &&
    Boolean(activeConceptUuid);

  // Get ecosystem loading state for V2 - also fetch while upgrade is in-flight
  const { isLoading: isEcosystemV2Loading } = useEcosystem(
    shouldFetchEcosystem ? activeConceptUuid : '',
  );

  // Check if ecosystem section is pending from backend status
  const isEcosystemSectionPending =
    concept?.reportStatusBySection?.ecosystem?.status === 'pending';

  // Show skeleton while upgrading, loading data, or when section is pending
  // This keeps the loading isolated to just the Ecosystem subtab
  const shouldShowSkeletons =
    isAwaitingEcosystemUpgrade ||
    isEcosystemV2Loading ||
    isEcosystemSectionPending;
  const isV2ExperienceActive = shouldRenderV2 || isAwaitingEcosystemUpgrade;

  const handleUpgrade = () => {
    setIsAwaitingEcosystemUpgrade(true);
    generateEcosystem(concept.identifier, {
      onError: () => setIsAwaitingEcosystemUpgrade(false),
    });
  };

  useEffect(() => {
    if (!isAwaitingEcosystemUpgrade) return;
    if (shouldRenderV2 && !isEcosystemV2Loading) {
      setIsAwaitingEcosystemUpgrade(false);
    }
  }, [isAwaitingEcosystemUpgrade, shouldRenderV2, isEcosystemV2Loading]);

  useEffect(() => {
    setIsAwaitingEcosystemUpgrade(false);
  }, [concept.identifier]);

  return (
    <div data-section-id='ecosystem_v2' className='flex w-full flex-col gap-6'>
      {!shouldRenderV2 && (
        <VersionUpgradeBanner
          onUpgrade={handleUpgrade}
          isLoading={isUpgrading || isAwaitingEcosystemUpgrade}
          buttonText='Upgrade to new Ecosystem'
        />
      )}
      {isV2ExperienceActive ? (
        shouldShowSkeletons ? (
          <EcosystemV2Skeleton />
        ) : (
          <EcosystemV2 conceptId={activeConceptUuid} />
        )
      ) : (
        <>
          <div className='flex w-full flex-col gap-4'>
            <h2 className='font-bold leading-[30px] text-[#0C111D]'>
              Ecosystem
            </h2>
            <EditModeSwitcher
              value={ecosystemDescription.value}
              label=''
              name='ecosystemDescription'
              maxLength={ecosystemDescription.validation.maxLength}
              onChange={ecosystemDescription.handleChange}
              handleSave={ecosystemDescription.handleSave}
              handleCancel={ecosystemDescription.handleCancel}
            />
          </div>
          <div className='flex w-full flex-col gap-4'>
            <StartupList startups={marketScan?.startups || []} />
          </div>
          <div className='flex w-full flex-col gap-4'>
            <IncumbentsList incumbents={marketScan?.incumbents || []} />
          </div>
        </>
      )}
    </div>
  );
};

export default Ecosystem;
