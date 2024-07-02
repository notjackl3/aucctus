import React from 'react';
// import Icon from './Icons/Icon/Icon';

interface ISeedFieldProps {
  question: string;
  answer: string;
}

const SeedField: React.FC<ISeedFieldProps> = ({ question, answer }) => {
  return (
    <div className='flex min-w-32 max-w-80 flex-row items-end justify-end gap-3'>
      <div className='inline-flex w-full flex-col items-start justify-start gap-2.5'>
        <span className='text-sm font-medium text-slate-500'>{question}</span>
        <div className=' inline-flex max-w-prose items-center justify-start gap-2 self-stretch rounded-lg border border-slate-200 bg-white px-3 py-2 shadow'>
          <p className='grow basis-0 text-sm font-normal text-indigo-900'>{answer}</p>
        </div>
      </div>
      {/* <button className='btn btn-primary-light btn-no-border h-8 w-8 items-center justify-center p-2'>
        <Icon variant='file-attachment' />
      </button> */}
    </div>
  );
};

export default SeedField;
