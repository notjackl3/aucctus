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
    <div className='aucctus-border-brand aucctus-bg-primary rounded-lg border bg-opacity-50 p-4'>
      <div className='mb-2 flex items-start justify-between'>
        <h3 className='aucctus-text-primary aucctus-text-xs-medium items-center'>
          {title}
        </h3>
        <div className='mb-1 flex items-center justify-between'>
          <Icon
            variant='ai-conclusion'
            className='stroke-primary-900'
            height='14'
            width='14'
          />
          <span className='aucctus-text-brand-primary aucctus-text-xs-bold px-2 py-1'>
            AI Conclusion
          </span>
        </div>
      </div>
      <p className='aucctus-text-brand-secondary aucctus-text-xs'>{content}</p>
    </div>
  );
};

export default AiConclusionBox;
