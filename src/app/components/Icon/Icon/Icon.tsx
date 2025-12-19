import React from 'react';
import { FunctionComponent } from 'react';
import spritePath from './icon-sprite.svg';

// Hardcoded hash value
const ICON_HASH = 'bd178fa8c0104247145734de1b509f22';

export interface IconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  variant: IconVariant;
  className?: string;
}

const Icon: FunctionComponent<IconProps> = ({
  variant,
  height = 18,
  width = 18,
  className = 'stroke-gray-light-700 fill-none',
  ...props
}) => {
  return (
    <svg width={width} height={height} className={className} {...props}>
      <use href={`${spritePath}?hash=${ICON_HASH}#${variant}`} />
    </svg>
  );
};

export default Icon;
