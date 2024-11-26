import { Button, Icon } from '@components';
import React from 'react';

interface ExpandAnExistingIdeaFooterProps {
  disabled?: boolean;
  onSeeIdeasClick: () => void;
  onExpandClick: () => void;
}

const ExpandAnExistingIdeaFooter: React.FC<ExpandAnExistingIdeaFooterProps> = ({
  disabled = false,
  onSeeIdeasClick,
  onExpandClick,
}) => {
  return (
    <>
      <Button
        color='light'
        className='px-2.5 py-2'
        disabled={disabled}
        onClick={onSeeIdeasClick}
      >
        See Similar Ideas
      </Button>

      <Button
        color='primary'
        className=' px-2.5 py-2'
        disabled={disabled}
        onClick={onExpandClick}
      >
        Expand This Idea
        <Icon variant='arrowright' />
      </Button>
    </>
  );
};

export default ExpandAnExistingIdeaFooter;
