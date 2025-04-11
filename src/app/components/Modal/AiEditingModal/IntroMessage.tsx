import FloatingAiIcon from '@components/Card/ConceptGeneration/Generation/FloatingAiIcon';
import React from 'react';

const IntroMessage: React.FC = () => {
  return (
    <div className='flex flex-1 flex-col items-center justify-center'>
      <FloatingAiIcon showPulse={false} />
      <span className='aucctus-text-white aucctus-text-md-semibold mt-4'>
        AI Editing
      </span>
      <span className='aucctus-text-white aucctus-text-sm mt-1'>
        Describe how you want this report to change
      </span>
    </div>
  );
};

export default IntroMessage;
