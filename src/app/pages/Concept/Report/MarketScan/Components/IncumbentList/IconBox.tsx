// _shared/IconBox.tsx
import { Icon } from '@components';
import React from 'react';

interface IconBoxProps {
  variant: IconVariant;
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
      className='cursor-pointer rounded-md bg-[#EAECF0] p-[4px]'
      onClick={onClick}
    >
      <Icon variant={variant} height={height} width={width} stroke={stroke} />
    </div>
  );
};

export default IconBox;
