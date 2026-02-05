import React from 'react';
import { FunctionComponent } from 'react';
import spritePath from './icon-sprite.svg';
import { cn } from '@libs/utils/react';

// Hardcoded hash value
const ICON_HASH = 'b4a95d31d7b73ed6dc2eec381b45bdbb';

export type AgentDecidedColor =
  | 'primary'
  | 'secondary'
  | 'brand'
  | 'error'
  | 'warning'
  | 'success'
  | 'info'
  | 'disabled';

const colorToStrokeClass: Record<AgentDecidedColor, string> = {
  primary: 'aucctus-stroke-primary',
  secondary: 'aucctus-stroke-secondary',
  brand: 'aucctus-stroke-brand-primary',
  error: 'aucctus-stroke-error-primary',
  warning: 'aucctus-stroke-warning-primary',
  success: 'aucctus-stroke-success-primary',
  info: 'aucctus-stroke-info-primary',
  disabled: 'aucctus-stroke-disabled',
};

export interface IconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  variant: IconVariant;
  className?: string;
  agentDecidedColor?: AgentDecidedColor;
}

const Icon: FunctionComponent<IconProps> = ({
  variant,
  height = 18,
  width = 18,
  className = 'stroke-gray-light-700 fill-none',
  agentDecidedColor,
  ...props
}) => {
  const strokeClass = agentDecidedColor
    ? colorToStrokeClass[agentDecidedColor]
    : undefined;

  return (
    <svg
      width={width}
      height={height}
      className={cn(strokeClass, className)}
      {...props}
    >
      <use href={`${spritePath}?hash=${ICON_HASH}#${variant}`} />
    </svg>
  );
};

export default Icon;
