import { Button } from '@components';
import { useSeedUpdate } from '@hooks/query/concepts.hook';
import {
  ConceptIncubationQuestionnaireType,
  SeedStatus,
} from '@libs/api/types';
import useStore from '@stores/store';
import React from 'react';

interface ISeedActionMenuButton {
  uuid: string;
  status?: SeedStatus;
  seedType?: ConceptIncubationQuestionnaireType;
}

const SeedActionMenuButton: React.FC<ISeedActionMenuButton> = ({
  uuid,
  status,
  seedType,
}) => {
  const { mutate: updateSeed } = useSeedUpdate();
  const { clearLastActiveSeedUuid } = useStore((state) => state.ideaPlayground);

  const handleArchive = (id: string) => {
    updateSeed(
      {
        uuid: id,
        status: 'archived',
      },
      {
        onSuccess: () => {
          if (seedType === 'IDEA_PLAYGROUND') {
            clearLastActiveSeedUuid();
          }
        },
      },
    );
  };

  const handleUnarchive = (id: string) => {
    updateSeed({
      uuid: id,
      status: 'draft',
    });
  };

  return (
    <Button.ActionsMenuButton
      identifier={uuid}
      status={status}
      onArchive={handleArchive}
      onUnarchive={handleUnarchive}
      buttonClassName='btn btn-light btn-bold p-2'
      iconSize={28}
    />
  );
};

// Seed-specific wrapper that uses the generic component
export default SeedActionMenuButton;
