import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useGenerateKeyAssumptions } from '@hooks/query/concepts.hook';
import AssumptionsV1 from './Assumptions/AssumptionsV1';
import AssumptionsV2 from './Assumptions/AssumptionsV2';
import { VersionUpgradeBanner } from '@components';
import { IConceptReportContext } from './ConceptReport/ConceptReport';
import { AppPath } from '@routes/routes';

const AssumptionsWrapper: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const navigate = useNavigate();
  const { mutate: generateKeyAssumptions, isLoading } =
    useGenerateKeyAssumptions();

  // Use concept's featureVersions to determine which version to render
  const featureVersion = concept.featureVersions?.assumptions || 'v1';
  const shouldRenderV2 = featureVersion === 'v2';

  const handleUpgrade = () => {
    generateKeyAssumptions(concept.identifier, {
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
      {!shouldRenderV2 && (
        <VersionUpgradeBanner
          featureName='Key Assumptions'
          onUpgrade={handleUpgrade}
          isLoading={isLoading}
        />
      )}
      {shouldRenderV2 ? <AssumptionsV2 /> : <AssumptionsV1 />}
    </>
  );
};

export default AssumptionsWrapper;
