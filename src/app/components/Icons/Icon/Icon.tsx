import { FunctionComponent } from 'react';
import svg from './icon-sprite.svg';

interface IconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  variant: IconVariant;
  title?: string;
}

const Icon: FunctionComponent<IconProps> = ({ variant, height = 24, width = 24, stroke = '#7586A9', ...props }) => {
  return (
    <svg height={height} width={width} stroke={stroke} {...props}>
      <use href={`${svg}#${variant}`} />
    </svg>
  );
};

export default Icon;
