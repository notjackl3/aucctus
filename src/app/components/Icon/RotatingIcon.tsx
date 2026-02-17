import { resolveIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import type { LucideProps } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';

interface RotatingIconProps extends LucideProps {
  isUp: boolean;
  variant?: string;
}

const RotatingIcon: React.FC<RotatingIconProps> = ({
  isUp = false,
  variant = 'chevronup',
  className,
  ...props
}) => {
  const IconComponent = resolveIcon(variant);

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
      <IconComponent
        className={cn('stroke-gray-light-700', className)}
        {...props}
      />
    </motion.div>
  );
};

export default React.memo(RotatingIcon);
