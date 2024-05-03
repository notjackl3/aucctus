import { FunctionComponent } from 'react';
import svg from './icon-sprite.svg';

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
      <use href={`${svg}#${variant}`} />
    </svg>
  );
};

export default Icon;
