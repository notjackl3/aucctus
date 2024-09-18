import React from 'react';

interface CountProps {
  value: number | string;
}

const Count: React.FC<CountProps> = ({ value }) => {
  return (
    <div className=' inline-flex h-6 items-center justify-start gap-0.5 rounded-lg bg-violet-50 p-2'>
      <span className="font-['DM Sans'] text-center text-xs font-medium leading-[18px] text-indigo-600">
        {value}
      </span>
    </div>
  );
};

export default Count;
