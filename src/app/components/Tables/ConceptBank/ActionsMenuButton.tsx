import { Icon } from '@components';
import {
  useConceptUpdate,
  useUnarchiveConcept,
} from '@hooks/query/concepts.hook';
import { ConceptStatus } from '@libs/api/types';
import * as Popover from '@radix-ui/react-popover';
import React from 'react';

interface IConceptActionMenuButton {
  uuid: string;
  status: ConceptStatus;
}

// TODO: Store Status of pre-archive

const ConceptActionMenuButton: React.FC<IConceptActionMenuButton> = ({
  uuid,
  status,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const { mutate: unarchiveConcept } = useUnarchiveConcept();
  const { mutate: updateConcept } = useConceptUpdate();

  const label = status !== 'archived' ? 'Archive' : 'Unarchive';

  return (
    <Popover.Root open={open}>
      <Popover.Trigger asChild>
        <button
          className='btn btn-no-border p-0'
          aria-label='Update Concept'
          onClick={() => setOpen(!open)}
        >
          <Icon variant='dots-vertical' />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='rounded bg-white p-2 shadow-lg will-change-[transform,opacity] focus:shadow-lg'
          side='left'
        >
          <div
            className='flex flex-col gap-4'
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <button
              className='btn btn-no-border btn-light'
              onClick={() => {
                if (status === 'archived') {
                  unarchiveConcept(uuid);
                } else {
                  updateConcept({
                    uuid,
                    status: 'archived',
                  });
                }
                setOpen(false);
              }}
            >
              {label}
            </button>
          </div>
          <Popover.Arrow className=' fill-white' />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default ConceptActionMenuButton;
