import React from 'react';
import { Icon } from '@components';

interface AiConclusionBoxProps {
  title: string;
  content?: string; // or string | undefined
}

const AiConclusionBox: React.FC<AiConclusionBoxProps> = ({
  title,
  content = '',
}) => {
  return (
    <div className='rounded-lg border border-[#868FF9] bg-[#F4F7FE] p-4'>
      <div className='mb-2 flex items-start justify-between'>
        <h3 className="font-['Inter'] text-[10px] font-medium leading-[20px] text-[#667085]">
          {title}
        </h3>
        <div className='mb-1 flex items-center justify-between'>
          <Icon
            variant='ai-conclusion'
            stroke='#4318FF'
            height='14'
            width='14'
          />
          <span className="px-2 py-1 font-['Inter'] text-[10px] font-semibold leading-[18px] text-[#4318FF]">
            AI Conclusion
          </span>
        </div>
      </div>
      <p className="font-['Inter'] text-[12px] font-normal leading-[18px] text-[#0C111D]">
        {content}
      </p>
    </div>
  );
};

export default AiConclusionBox;
