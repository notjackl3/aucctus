import { cn } from '@libs/utils/react';
import React from 'react';

interface ITextProps {
  value: string;
  className?: string;
}

const Description: React.FC<ITextProps> = ({ value, className }) => {
  return (
    <span
      className={cn(
        'aucctus-text-secondary text-base font-medium leading-tight',
        className,
      )}
    >
      {value}
    </span>
  );
};

export default Description;
