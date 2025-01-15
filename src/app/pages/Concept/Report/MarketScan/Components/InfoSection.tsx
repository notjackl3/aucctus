import { Button, Icon } from '@components';
import { cn } from '@libs/utils/react';
import React from 'react';

interface InfoSectionProps {
  title: string;
  content: string;
  iconVariant?: IconVariant;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  contentClassName?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  title,
  content,
  iconVariant = 'book-open',
  contentClassName,
  onClick,
}) => {
  return (
    <section className='pb-4'>
      <div className='mb-1 flex items-start justify-between'>
        <h3 className='text-[10px] font-medium leading-[20px] text-[#667085]'>
          {title}
        </h3>
        {onClick && (
          <Button color='grey' noBorder size='xs' onClick={onClick}>
            <Icon variant={iconVariant} />
          </Button>
        )}
      </div>
      <p
        className={cn(
          'text-[12px] font-normal leading-[18px] text-[#0C111D]',
          contentClassName,
        )}
      >
        {content}
      </p>
    </section>
  );
};

export default InfoSection;
