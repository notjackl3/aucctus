import { Button } from '@components';
import { useSeedUpdate } from '@hooks/query/concepts.hook';
import { SeedStatus } from '@libs/api/types';
import React from 'react';

interface ISeedActionMenuButton {
  uuid: string;
  status?: SeedStatus;
}

const SeedActionMenuButton: React.FC<ISeedActionMenuButton> = ({
  uuid,
  status,
}) => {
  const { mutate: updateSeed } = useSeedUpdate();

  const handleArchive = (id: string) => {
    updateSeed({
      uuid: id,
      status: 'archived',
    });
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
