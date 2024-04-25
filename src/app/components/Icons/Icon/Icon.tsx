import { FunctionComponent } from 'react';

interface IconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  variant: IconVariant;
  title?: string;
}

const Icon: FunctionComponent<IconProps> = ({ variant, height = 24, width = 24, stroke = '#7586A9', ...props }) => {
  return (
    <svg height={height} width={width} stroke={stroke} {...props}>
      <use href={`assets/icon-sprite.svg#${variant}`} />
    </svg>
  );
};

export default Icon;
