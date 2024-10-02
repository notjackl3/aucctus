import { cn } from '@libs/utils/react';
import React from 'react';

interface HeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  text: string;
}

const HeaderOne: React.FC<HeaderProps> = ({ text, className, ...props }) => {
  return (
    <h1
      className={cn(
        'text-[2rem] font-bold capitalize not-italic text-indigo-900',
        className,
      )}
      {...props}
    >
      {text}
    </h1>
  );
};

export default HeaderOne;
