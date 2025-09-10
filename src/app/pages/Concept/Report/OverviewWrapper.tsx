import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  useConceptOverview,
  useGenerateConceptOverview,
} from '@hooks/query/concepts.hook';
import OverviewDetails from './OverviewDetails';
import { VersionUpgradeBanner } from '@components';
import { IConceptReportContext } from './ConceptReport/ConceptReport';
import { AppPath } from '@routes/routes';

const OverviewWrapper: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const navigate = useNavigate();
  const { mutate: generateOverview, isLoading } = useGenerateConceptOverview();
  // TODO: Integrate with the overview details component later
  useConceptOverview(concept?.uuid);

  // Since overview is not currently tracked in featureVersions, always render the current version
  // This can be updated when overview is added to the FeatureName type
  const shouldRenderV2 = true;

  const handleUpgrade = () => {
    generateOverview(concept.identifier, {
      onSuccess: () => {
        // Navigate to concept bank after starting generation
        navigate(AppPath.ConceptBank, {
          replace: true,
        });
      },
    });
  };

  return (
    <>
      {/* Show upgrade banner if not v2 */}
      {!shouldRenderV2 && (
        <VersionUpgradeBanner
          onUpgrade={handleUpgrade}
          isLoading={isLoading}
          featureName='overview'
        />
      )}

      <OverviewDetails />
    </>
  );
};

export default OverviewWrapper;
