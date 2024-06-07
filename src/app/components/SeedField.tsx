import { FunctionComponent } from 'react';

interface ISeedFieldProps {
  question: string;
  answer: string;
}

const SeedField: FunctionComponent<ISeedFieldProps> = ({ question, answer }) => {
  return (
    <div className='inline-flex shrink grow basis-0 flex-col items-start justify-start gap-2.5'>
      <div className='flex h-20 flex-col items-start justify-start gap-1.5 self-stretch'>
        <div className='text-sm font-medium leading-tight text-slate-500'>{question}</div>
        <div className='inline-flex items-center justify-start gap-2 self-stretch rounded-lg border border-slate-200 bg-white px-3 py-2 shadow'>
          <div className='flex h-10 shrink grow basis-0 items-center justify-start gap-2'>
            <div className='shrink grow basis-0 text-sm font-normal leading-tight text-indigo-900'>{answer}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedField;
