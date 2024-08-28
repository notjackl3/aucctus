import { FunctionComponent } from 'react';

interface WhiteSpaceSuggestionsProps {
  title: string;
  subtitle: string;
}

const WhiteSpaceSuggestion: FunctionComponent<WhiteSpaceSuggestionsProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div className='inline-flex w-80 items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-4 shadow'>
      <div className='inline-flex flex-col items-start justify-center gap-1.5 blur-xs'>
        <div className="w-44 font-['Inter'] text-sm font-medium text-slate-500">
          {title}
        </div>
        <div className="w-44 font-['Inter'] text-xs font-normal text-slate-500">
          {subtitle}
        </div>
      </div>
      <button
        className='btn btn-light flex h-10 items-center justify-start gap-2 rounded-lg border border-violet-50 bg-gray-50 px-4 py-2.5 disabled:cursor-not-allowed'
        disabled
      >
        Explore
      </button>
    </div>
  );
};

export default WhiteSpaceSuggestion;
