import { FunctionComponent } from 'react';
import spritePath from './icon-sprite.svg';
import { cn } from '@libs/utils/react';

// Hardcoded hash value
const ICON_HASH = '21a693d7a3d2b4985181b1b1cca18591';

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
