import React from 'react';
import Icon from './Icon/Icon';
import { cn } from '@libs/utils/react';

const defaultIconProps = {
  stroke: '#000',
  width: 24,
  height: 24,
};

export interface IFeatureIconProps {
  icon: IconVariant;
  color: 'primary' | 'success' | 'warning' | 'error';
}

const colorStyle = {
  primary: 'aucctus-bg-secondary',
  success: 'aucctus-bg-success-primary',
  warning: 'aucctus-bg-warning-primary',
  error: 'aucctus-bg-error-primary',
};

const strokeStyle = {
  primary: 'stroke-primary-900',
  success: 'stroke-success-900',
  warning: 'stroke-warning-900',
  error: 'stroke-error-900',
};

const FeatureIcon: React.FC<IFeatureIconProps> = ({ icon, color }) => {
  return (
    <div
      className={cn(
        'inline-flex h-14 w-14 items-center justify-center gap-2.5 rounded-full p-3.5',
        colorStyle[color],
      )}
    >
      <div className='relative flex h-7 w-7 items-center justify-center'>
        <Icon
          variant={icon}
          {...defaultIconProps}
          className={strokeStyle[color]}
        />
      </div>
    </div>
  );
};

export default FeatureIcon;
