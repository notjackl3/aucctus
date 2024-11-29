import React from 'react';

interface ISeedFieldProps {
  question: string;
  answer: string;
}

const SeedField: React.FC<ISeedFieldProps> = ({ question, answer }) => {
  return (
    <div className='flex min-w-32 max-w-80 flex-row items-center justify-center gap-3'>
      <div className='flex-start inline-flex w-full flex-col justify-start gap-2.5'>
        <span className='text-base font-medium text-slate-500'>{question}</span>
        <div className=' inline-flex max-w-prose items-center justify-start gap-2 self-stretch rounded-lg border border-slate-200 bg-white px-3 py-2 shadow'>
          <p className='grow basis-0 text-sm font-normal text-indigo-900'>
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeedField;
