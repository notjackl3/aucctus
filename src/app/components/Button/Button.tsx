import { cn } from '@libs/utils/react';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color:
    | 'primary'
    | 'primary-light'
    | 'light'
    | 'light-primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'disabled'
    | 'grey';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  bold?: boolean;
  noBorder?: boolean;
  link?: boolean;
  noHover?: boolean;
}

const ButtonComp: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  ButtonProps
> = (
  {
    children,
    color,
    size,
    bold = false,
    noBorder = false,
    link = false,
    noHover = false,
    className,
    ...props
  },
  ref,
) => {
  const buttonClassNames = cn(
    'btn',
    `btn-${color}`,
    {
      [`btn-${size}`]: size,
      'btn-bold': bold,
      'btn-no-border': noBorder,
      'btn-link': link,
      'btn-no-hover': noHover,
    },
    className,
  );

  return (
    <button {...props} className={buttonClassNames} ref={ref}>
      {children}
    </button>
  );
};

const Button = React.forwardRef(ButtonComp);
export default Button;
