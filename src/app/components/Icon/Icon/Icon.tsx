import React from 'react';
import { FunctionComponent } from 'react';
import spritePath from './icon-sprite.svg';

// Hardcoded hash value
const ICON_HASH = 'da8d2620eae2a6a792ad7dc8437c7bd2';

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
