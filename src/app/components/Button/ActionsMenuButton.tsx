import { Icon } from '@components';
import { ConceptStatus, SeedStatus } from '@libs/api/types';
import * as Popover from '@radix-ui/react-popover';
import React from 'react';
import ClickAwayListener from 'react-click-away-listener';

import { cn } from '@libs/utils/react';

// Common interface for all action menu buttons
interface IActionsMenuButtonProps {
  identifier: string;
  status?: ConceptStatus | SeedStatus;
  onArchive: (identifier: string) => void;
  onUnarchive: (identifier: string) => void;
  buttonClassName?: string;
  iconSize?: number;
}

// Generic Actions Menu Button that can be used for both concepts and seeds
const ActionsMenuButton: React.FC<IActionsMenuButtonProps> = ({
  identifier,
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
                    onUnarchive(identifier);
                  } else {
                    onArchive(identifier);
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

export default ActionsMenuButton;
