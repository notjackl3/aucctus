import { Button } from '@components';
import { cn } from '@libs/utils/react';
import React from 'react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface InfoSectionProps {
  title: string;
  content: string;
  iconVariant?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  contentClassName?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  title,
  content,
  iconVariant = 'book-open',
  contentClassName = 'aucctus-text-xs aucctus-text-secondary',
  onClick,
}) => {
  return (
    <section className='pb-4'>
      <div className='mb-1 flex items-start justify-between'>
        <h3 className='aucctus-text-sm-medium aucctus-text-primary'>{title}</h3>
        {onClick && (
          <Button color='grey' noBorder size='xs' onClick={onClick}>
            <DynamicIcon variant={iconVariant} />
          </Button>
        )}
      </div>
      <p className={cn(contentClassName, 'mt-2')}>{content}</p>
    </section>
  );
};

export default InfoSection;
