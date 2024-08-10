import { Badge } from '@components';
import { ConceptStatus } from '@libs/api/types';
import React from 'react';

interface IStatusProps {
  value: ConceptStatus;
}

const Status: React.FC<IStatusProps> = ({ value }) => {
  return (
    <span className='m-auto flex h-full w-full items-center justify-start self-stretch align-middle'>
      <Badge.ConceptStatus status={value} />
    </span>
  );
};

export default Status;
