import { Button } from '@components';
import {
  useConceptUpdate,
  useUnarchiveConcept,
} from '@hooks/query/concepts.hook';
import { ConceptStatus } from '@libs/api/types';

import React from 'react';

// Concept-specific wrapper that uses the generic component
interface IConceptActionMenuButton {
  uuid: string;
  status: ConceptStatus;
}

const ConceptActionMenuButton: React.FC<IConceptActionMenuButton> = ({
  uuid,
  status,
}) => {
  const { mutate: unarchiveConcept } = useUnarchiveConcept();
  const { mutate: updateConcept } = useConceptUpdate();

  const handleArchive = (id: string) => {
    updateConcept({
      uuid: id,
      status: 'archived',
    });
  };

  const handleUnarchive = (id: string) => {
    unarchiveConcept(id);
  };

  return (
    <Button.ActionsMenuButton
      uuid={uuid}
      status={status}
      onArchive={handleArchive}
      onUnarchive={handleUnarchive}
      buttonClassName='btn btn-light btn-bold p-2'
      iconSize={28}
    />
  );
};

export default ConceptActionMenuButton;
