import React from 'react';
import { cn } from '@libs/utils/react';
import { DynamicIcon } from '@libs/utils/iconMap';

export interface StatusConfig {
  bg: string;
  text: string;
  stroke: string;
  icon:
    | 'check'
    | 'closeX'
    | 'help-circle'
    | 'clipboard'
    | 'clock'
    | 'alert-triangle'
    | 'alert-circle'
    | 'check-circle-broken';
  label: string;
}

interface GenericStatusBadgeProps {
  config: StatusConfig;
  className?: string;
}

const GenericStatusBadge: React.FC<GenericStatusBadgeProps> = ({
  config,
  className,
}) => {
  return (
    <span
      className={cn(
        'aucctus-text-xs-medium aucctus-border-secondary inline-flex items-center gap-1 rounded-md border px-2 py-1',
        config.bg,
        config.text,
        className,
      )}
    >
      <DynamicIcon
        variant={config.icon}
        className={cn('h-3 w-3', config.stroke)}
      />
      {config.label}
    </span>
  );
};

export default GenericStatusBadge;
