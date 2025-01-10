import React from 'react';
import { Button, Icon } from '@components';

const iconDefaultProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

interface InfoSectionProps {
  title: string;
  content: string;
  onReasoningClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  title,
  content,
  onReasoningClick,
}) => {
  return (
    <section className='pb-4'>
      <div className='mb-1 flex items-start justify-between'>
        <h3 className="font-['Inter'] text-[10px] font-medium leading-[20px] text-[#667085]">
          {title}
        </h3>
        {onReasoningClick && (
          <Button color='light' size='xs' onClick={onReasoningClick}>
            <Icon variant='link-source' {...iconDefaultProps} />
          </Button>
        )}
      </div>
      <p className="font-['Inter'] text-[12px] font-normal leading-[18px] text-[#0C111D]">
        {content}
      </p>
    </section>
  );
};

export default InfoSection;
