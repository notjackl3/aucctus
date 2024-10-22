import { Badge, Header, Icon } from '@components';
import React from 'react';

interface AssumptionsTableProps {
  text: string;
  count: number | string;
  handleAdd: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const AssumptionsTable: React.FC<AssumptionsTableProps> = ({
  text,
  count,
  handleAdd,
}) => {
  return (
    <div className='inline-flex w-full items-center justify-between self-stretch border-b border-gray-200 px-3 py-2'>
      <div className='flex items-center justify-start gap-2.5 py-2.5'>
        <Header.Two text={text} className='text-xl' />
        <Badge.Count value={count} />
      </div>
      <button onClick={handleAdd}>
        <Icon variant='plus' />
      </button>
    </div>
  );
};

export default AssumptionsTable;
