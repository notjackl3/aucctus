import { Button } from '@components';
import {
  useConceptUpdate,
  useUnarchiveConcept,
} from '@hooks/query/concepts.hook';
import { ConceptStatus } from '@libs/api/types';

import React from 'react';

// Concept-specific wrapper that uses the generic component
interface IConceptActionMenuButton {
  status: ConceptStatus;
  identifier: string;
}

const ConceptActionMenuButton: React.FC<IConceptActionMenuButton> = ({
  status,
  identifier,
}) => {
  const { mutate: unarchiveConcept } = useUnarchiveConcept();
  const { mutate: updateConcept } = useConceptUpdate();

  const handleArchive = (identifier: string) => {
    updateConcept({
      identifier: identifier,
      status: 'archived',
    });
  };

  const handleUnarchive = (id: string) => {
    unarchiveConcept(id);
  };

  return (
    <Button.ActionsMenuButton
      identifier={identifier}
      status={status}
      onArchive={handleArchive}
      onUnarchive={handleUnarchive}
      buttonClassName='btn btn-light btn-bold p-2'
      iconSize={28}
    />
  );
};

export default ConceptActionMenuButton;
