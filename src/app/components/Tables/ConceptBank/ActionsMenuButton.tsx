import { Button } from '@components';
import {
  useConceptUpdate,
  useUnarchiveConcept,
  useConceptReportCancel,
} from '@hooks/query/concepts.hook';
import { ConceptStatus, ConceptReportStatus } from '@libs/api/types';

import React from 'react';

// Concept-specific wrapper that uses the generic component
interface IConceptActionMenuButton {
  status: ConceptStatus;
  identifier: string;
  reportStatus: ConceptReportStatus;
}

const ConceptActionMenuButton: React.FC<IConceptActionMenuButton> = ({
  status,
  identifier,
  reportStatus,
}) => {
  const { mutate: unarchiveConcept } = useUnarchiveConcept();
  const { mutate: updateConcept } = useConceptUpdate();
  const { mutate: cancelReport } = useConceptReportCancel();

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

  return (
    <Button.ActionsMenuButton
      identifier={identifier}
      status={status}
      reportStatus={reportStatus}
      onArchive={handleArchive}
      onUnarchive={handleUnarchive}
      onCancelReport={handleCancelReport}
      buttonClassName='btn btn-light btn-bold p-2'
      iconSize={28}
    />
  );
};

export default ConceptActionMenuButton;
