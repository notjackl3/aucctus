import { cn } from '@libs/utils/react';
import React from 'react';

interface AiFrostedCardProps {
  title?: string;
  message: string;
  onClick?: () => void;
  className?: string;
}

const AiFrostedCard: React.FC<AiFrostedCardProps> = ({
  title,
  message,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'aucctus-border-primary flex animate-fade-in cursor-pointer flex-col gap-2 rounded-lg border border-opacity-50 bg-white bg-opacity-25 p-4 backdrop-blur-lg transition-all duration-200',
        { 'hover:brightness-125': !!onClick },
        className,
      )}
    >
      {title && (
        <div className='aucctus-text-md-medium text-gray-light-100'>
          {title}
        </div>
      )}
      <div className='aucctus-text-sm text-gray-light-200'>{message}</div>
    </div>
  );
};

export default AiFrostedCard;
