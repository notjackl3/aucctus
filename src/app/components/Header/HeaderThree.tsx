import { cn } from '@libs/utils/react';
import React from 'react';
interface HeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  text: string;
}

const HeaderThree: React.FC<HeaderProps> = ({ text, className, ...props }) => {
  return (
    <h3
      className={cn(
        'aucctus-text-primary text-base font-medium leading-normal',
        className,
      )}
      {...props}
    >
      {text}
    </h3>
  );
};

export default HeaderThree;
