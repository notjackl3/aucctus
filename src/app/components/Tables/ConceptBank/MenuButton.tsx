import { Icon } from '@components';
import * as Popover from '@radix-ui/react-popover';
import React from 'react';

const ConceptTableMenuButtonCol: React.FC = () => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className='btn btn-no-border p-0' aria-label='Update Concept'>
          <Icon variant='dots-vertical' />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='rounded bg-white p-2 shadow-lg will-change-[transform,opacity] focus:shadow-lg'
          sideOffset={5}
        >
          <div className='flex flex-col gap-4' style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className='btn btn-no-border btn-light'>
              <Icon variant='trash' />
              Archive
            </button>
          </div>
          <Popover.Arrow className=' fill-white' />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default ConceptTableMenuButtonCol;
