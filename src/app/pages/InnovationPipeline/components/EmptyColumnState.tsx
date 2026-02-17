import { Inbox } from 'lucide-react';
interface EmptyColumnStateProps {
  stageName: string;
}

const EmptyColumnState = ({ stageName }: EmptyColumnStateProps) => {
  return (
    <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center dark:border-gray-700'>
      <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
        <Inbox className='h-6 w-6 stroke-gray-400' />
      </div>
      <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
        No concepts in {stageName}
      </p>
      <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
        Drag concepts here to advance them
      </p>
    </div>
  );
};

export default EmptyColumnState;
