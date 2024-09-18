import { FunctionComponent } from 'react';
import spritePath from './icon-sprite.svg';

// Hardcoded hash value
const ICON_HASH = 'e9db234b6ad9908c5687775e3009580c';

interface IconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  variant: IconVariant;
  title?: string;
}

const Icon: FunctionComponent<IconProps> = ({
  variant,
  height = 18,
  width = 18,
  stroke = '#7586A9',
  fill = 'none',
  ...props
}) => {
  return (
    <svg height={height} width={width} stroke={stroke} fill={fill} {...props}>
      <use href={`${spritePath}?hash=${ICON_HASH}#${variant}`} />
    </svg>
  );
};

export default Icon;
