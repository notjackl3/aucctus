import { Icon } from '@components';
import React from 'react';
import { motion } from 'framer-motion';
import { IconProps } from './Icon/Icon';

interface RotatingIconProps extends Omit<IconProps, 'variant'> {
  isUp: boolean;
  variant?: IconVariant;
}

const RotatingIcon: React.FC<RotatingIconProps> = ({
  isUp = false,
  variant = 'chevronup',
  ...props
}) => {
  return (
    <motion.div
      initial={false}
      animate={{ rotate: isUp ? 0 : 180 }}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      style={{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Icon variant={variant} {...props} />
    </motion.div>
  );
};

export default React.memo(RotatingIcon);
