import React from 'react';

interface StatusTooltipProps {
  text: string;
}

const StatusTooltip: React.FC<StatusTooltipProps> = ({ text }) => {
  return (
    <div className='aucctus-bg-primary aucctus-text-primary aucctus-border-secondary aucctus-text-xs rounded-md border px-3 py-1.5 shadow-md'>
      {text}
    </div>
  );
};

export default StatusTooltip;
