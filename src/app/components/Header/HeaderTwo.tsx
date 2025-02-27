import { cn } from '@libs/utils/react';
import React from 'react';
interface TwoProps extends React.HTMLAttributes<HTMLHeadingElement> {
  text: string;
}

const Two: React.FC<TwoProps> = ({ text, className, ...props }) => {
  return (
    <h2
      className={cn(
        'aucctus-text-brand-primary text-2xl font-semibold capitalize not-italic',
        className,
      )}
      {...props}
    >
      {text}
    </h2>
  );
};

export default Two;
