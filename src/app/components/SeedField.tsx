import { FunctionComponent } from 'react';

interface ISeedFieldProps {
  question: string;
  answer: string;
}

const SeedField: FunctionComponent<ISeedFieldProps> = ({ question, answer }) => {
  return (
    <div className='flex min-w-32 max-w-80 flex-col items-end justify-end gap-3'>
      <div className='inline-flex w-full flex-col items-start justify-start gap-2.5'>
        <span className='text-sm font-medium text-slate-500'>{question}</span>
        <div className=' inline-flex max-w-prose items-center justify-start gap-2 self-stretch rounded-lg border border-slate-200 bg-white px-3 py-2 shadow'>
          <p className='grow basis-0 text-sm font-normal text-indigo-900'>{answer}</p>
        </div>
      </div>
      {/* <div className="Button w-8 h-8 p-2 bg-violet-50 rounded-lg border border-violet-50 justify-center items-center gap-2 flex">
        <div className="FileAttachment01 w-5 h-5 relative" />
      </div> */}
    </div>
  );
};

export default SeedField;
