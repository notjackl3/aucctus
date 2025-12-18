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
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';

// Concept-specific wrapper that uses the generic component
interface IConceptActionMenuButton {
  status: ConceptStatus;
  identifier: string;
  conceptUuid: string; // Add conceptUuid for operations that need it
  reportStatus: ConceptReportStatus;
  seedUuid?: string; // Add seedUuid to enable cloning
}

const ConceptActionMenuButton: React.FC<IConceptActionMenuButton> = ({
  status,
  identifier,
  conceptUuid,
  reportStatus,
  seedUuid,
}) => {
  const { mutate: unarchiveConcept } = useUnarchiveConcept();
  const { mutate: updateConcept } = useConceptUpdate();
  const { mutate: cancelReport } = useConceptReportCancel();
  const { mutate: cloneSeed } = useCloneSeed();
  const navigate = useNavigate();
  const { resetQuestionnaire, setIsNewSeed } = useConceptIncubationStore();

  const handleArchive = (identifier: string) => {
    updateConcept({
      identifier: identifier,
      status: 'archived',
    });
  };

  const handleUnarchive = (id: string) => {
    unarchiveConcept(id);
  };

  const handleCancelReport = () => {
    // Use conceptUuid for the mutation, not the identifier
    cancelReport({ conceptUuid, conceptIdentifier: identifier });
  };

  const handleCloneConceptSeed = () => {
    if (!seedUuid) {
      toast.error('Clone Failed', 'No seed available to clone');
      return;
    }

    cloneSeed(seedUuid, {
      onSuccess: (clonedSeed) => {
        toast.success('Concept seed cloned successfully!');
        // Navigate to the incubation page with the cloned seed
        resetQuestionnaire();
        setIsNewSeed(false);

        let baseUrl = `${AppPath.IncubateConcept}`;
        if (clonedSeed.type === 'IDEA_PLAYGROUND') {
          baseUrl = `${AppPath.IdeaPlayground}`;
        }

        navigate(
          `${baseUrl}/?${new URLSearchParams({
            seed: clonedSeed.uuid,
          }).toString()}`,
        );
      },
      onError: (error) => {
        const message = utils.osiris.parseFormError(error);
        toast.error(
          'Clone Failed',
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
      onCancelReport={() => handleCancelReport()}
      onCloneConceptSeed={seedUuid ? () => handleCloneConceptSeed() : undefined}
      buttonClassName='btn btn-light btn-bold p-2'
      iconSize={28}
    />
  );
};

export default ConceptActionMenuButton;
