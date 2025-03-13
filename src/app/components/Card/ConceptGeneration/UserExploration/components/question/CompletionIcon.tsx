import { Icon } from '@components';
import { boxShadowStyle } from './QuestionIcon';
import React from 'react';

interface CompletionIconProps {
  className?: string;
}

export const CompletionIcon = ({ className }: CompletionIconProps) => {
  return (
    <span
      style={{ ...boxShadowStyle }}
      className='aucctus-bg-secondary aucctus-border-primary z-[10] ml-2 flex h-8 w-8 items-center justify-center rounded-md border stroke-primary-600 p-2'
    >
      <Icon className={className} variant='check' />
    </span>
  );
};

export default CompletionIcon;
