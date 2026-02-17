import { Badge, Header } from '@components';
import React from 'react';
import { Plus } from 'lucide-react';

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
    <div className='aucctus-border-secondary inline-flex w-full items-center justify-between self-stretch border-b px-3 py-2'>
      <div className='flex items-center justify-start gap-2.5 py-2.5'>
        <Header.Two text={text} className='text-xl' />
        <Badge.Count value={count} />
      </div>
      <button onClick={handleAdd}>
        <Plus />
      </button>
    </div>
  );
};

export default AssumptionsTable;
