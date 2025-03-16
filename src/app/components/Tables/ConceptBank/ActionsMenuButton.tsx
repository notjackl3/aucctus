import { Icon } from '@components';
import {
  useConceptUpdate,
  useUnarchiveConcept,
  useSeedUpdate,
} from '@hooks/query/concepts.hook';
import { ConceptSeedStatus, ConceptStatus } from '@libs/api/types';
import * as Popover from '@radix-ui/react-popover';
import ClickAwayListener from 'react-click-away-listener';
import React from 'react';
import { cn } from '@libs/utils/react';

// Common interface for all action menu buttons
interface IActionsMenuButtonProps {
  uuid: string;
  status?: ConceptStatus | ConceptSeedStatus;
  onArchive: (uuid: string) => void;
  onUnarchive: (uuid: string) => void;
  buttonClassName?: string;
  iconSize?: number;
}

// Generic Actions Menu Button that can be used for both concepts and seeds
const ActionsMenuButton: React.FC<IActionsMenuButtonProps> = ({
  uuid,
  status,
  onArchive,
  onUnarchive,
  buttonClassName = 'btn flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-white p-0 shadow-sm transition-all hover:bg-gray-50',
  iconSize = 24,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const label = status !== 'archived' ? 'Archive' : 'Unarchive';

  return (
    <Popover.Root open={open}>
      <Popover.Trigger asChild>
        <button
          className={cn(buttonClassName, {
            'bg-gray-50': open,
          })}
          aria-label='Update Item'
          onClick={() => setOpen(!open)}
        >
          <Icon variant='dots-vertical' height={iconSize} width={iconSize} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Popover.Content
            className='aucctus-bg-primary rounded p-2 shadow-lg will-change-[transform,opacity] focus:shadow-lg'
            side='left'
          >
            <div className='flex flex-col gap-4'>
              <button
                className='btn btn-no-border btn-light'
                onClick={() => {
                  if (status === 'archived') {
                    onUnarchive(uuid);
                  } else {
                    onArchive(uuid);
                  }
                  setOpen(false);
                }}
              >
                {label}
              </button>
            </div>
            <Popover.Arrow className='fill-white' />
          </Popover.Content>
        </ClickAwayListener>
      </Popover.Portal>
    </Popover.Root>
  );
};

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
    <ActionsMenuButton
      uuid={uuid}
      status={status}
      onArchive={handleArchive}
      onUnarchive={handleUnarchive}
      buttonClassName='btn btn-light btn-bold p-2'
      iconSize={28}
    />
  );
};

// Seed-specific wrapper that uses the generic component
interface ISeedActionMenuButton {
  uuid: string;
  status?: ConceptSeedStatus;
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
    <ActionsMenuButton
      uuid={uuid}
      status={status as ConceptSeedStatus}
      onArchive={handleArchive}
      onUnarchive={handleUnarchive}
      buttonClassName='btn btn-light btn-bold p-2'
      iconSize={28}
    />
  );
};

export { ConceptActionMenuButton, SeedActionMenuButton };
