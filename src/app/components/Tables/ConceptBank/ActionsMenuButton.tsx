import { Button, toast } from '@components';
import {
  useConceptUpdate,
  useUnarchiveConcept,
  useConceptReportCancel,
  useCloneSeed,
} from '@hooks/query/concepts.hook';
import { ConceptStatus, ConceptReportStatus } from '@libs/api/types';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '@routes/routes';
import utils from '@libs/utils';

import React from 'react';

// Concept-specific wrapper that uses the generic component
interface IConceptActionMenuButton {
  status: ConceptStatus;
  identifier: string;
  reportStatus: ConceptReportStatus;
  seedUuid?: string; // Add seedUuid to enable cloning
}

const ConceptActionMenuButton: React.FC<IConceptActionMenuButton> = ({
  status,
  identifier,
  reportStatus,
  seedUuid,
}) => {
  const { mutate: unarchiveConcept } = useUnarchiveConcept();
  const { mutate: updateConcept } = useConceptUpdate();
  const { mutate: cancelReport } = useConceptReportCancel();
  const { mutate: cloneSeed } = useCloneSeed();
  const navigate = useNavigate();

  const handleArchive = (identifier: string) => {
    updateConcept({
      identifier: identifier,
      status: 'archived',
    });
  };

  const handleUnarchive = (id: string) => {
    unarchiveConcept(id);
  };

  const handleCancelReport = (id: string) => {
    cancelReport(id);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCloneConceptSeed = (_conceptUuid: string) => {
    if (!seedUuid) {
      toast.error('No seed available to clone');
      return;
    }

    cloneSeed(seedUuid, {
      onSuccess: (clonedSeed) => {
        toast.success('Concept seed cloned successfully!');
        // Navigate to the incubation page with the cloned seed
        navigate(
          `${AppPath.IncubateConcept}/?${new URLSearchParams({
            seed: clonedSeed.uuid,
          }).toString()}`,
        );
      },
      onError: (error) => {
        const message = utils.osiris.parseFormError(error);
        toast.error(
          message || 'Failed to clone concept seed. Please try again.',
        );
      },
    });
  };

  return (
    <Button.ActionsMenuButton
      identifier={identifier}
      status={status}
      reportStatus={reportStatus}
      onArchive={handleArchive}
      onUnarchive={handleUnarchive}
      onCancelReport={handleCancelReport}
      onCloneConceptSeed={seedUuid ? handleCloneConceptSeed : undefined}
      buttonClassName='btn btn-light btn-bold p-2'
      iconSize={28}
    />
  );
};

export default ConceptActionMenuButton;
