import { FunctionComponent } from 'react';

interface IconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  variant: IconVariant;
  title?: string;
}

const Icon: FunctionComponent<IconProps> = ({ variant, ...props }) => {
  return (
    <svg {...props}>
      <use href={`assets/icon-sprite.svg#${variant}`} />
    </svg>
  );
};

export default Icon;
