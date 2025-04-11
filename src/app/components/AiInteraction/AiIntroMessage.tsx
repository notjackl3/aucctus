import React from 'react';
import FloatingAiIcon from '@components/Card/ConceptGeneration/Generation/FloatingAiIcon';

interface AiIntroMessageProps {
  title?: string;
  subtitle?: string;
}

const AiIntroMessage: React.FC<AiIntroMessageProps> = ({ title, subtitle }) => {
  return (
    <div className='flex flex-1 flex-col items-center justify-center'>
      <span className='flex-1' />
      <FloatingAiIcon showPulse={false} />
      {title && (
        <span className='aucctus-text-white aucctus-text-md-semibold mt-4'>
          {title}
        </span>
      )}
      {subtitle && (
        <span className='aucctus-text-white aucctus-text-sm mt-1'>
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default AiIntroMessage;
