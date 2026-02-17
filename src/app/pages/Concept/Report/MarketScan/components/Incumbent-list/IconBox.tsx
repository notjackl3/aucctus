// _shared/IconBox.tsx
import { cn } from '@libs/utils/react';
import React from 'react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface IconBoxProps {
  variant: string;
  onClick?: () => void;
  height?: number;
  width?: number;
  stroke?: string;
}

const IconBox: React.FC<IconBoxProps> = ({
  variant,
  onClick,
  height = 16,
  width = 16,
  stroke = '#2B3674',
}) => {
  return (
    <div
      className={cn(
        'cursor-pointer rounded-md bg-[#EAECF0] p-[4px] transition-colors',
        { 'hover:bg-gray-300': !!onClick },
      )}
      onClick={onClick}
    >
      <DynamicIcon
        variant={variant}
        height={height}
        width={width}
        stroke={stroke}
      />
    </div>
  );
};

export default IconBox;
