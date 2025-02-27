import React from 'react';

interface ISeedFieldProps {
  question: string;
  answer: string;
}

const SeedField: React.FC<ISeedFieldProps> = ({ question, answer }) => {
  return (
    <div className='flex min-w-32 max-w-80 flex-row items-center justify-center gap-3'>
      <div className='flex-start inline-flex w-full flex-col justify-start gap-2.5'>
        <span className='aucctus-text-tertiary aucctus-text-md-medium'>
          {question}
        </span>
        <div className=' aucctus-border-primary aucctus-bg-primary inline-flex max-w-prose items-center justify-start gap-2 self-stretch rounded-lg border px-3 py-2 shadow'>
          <p className='aucctus-text-primary aucctus-text-sm-normal grow basis-0'>
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeedField;
