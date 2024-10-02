import { Icon } from '@components';
import React from 'react';
import { animated, useSpring } from 'react-spring';
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
  const springProps = useSpring({
    transform: isUp ? 'rotate(0deg)' : 'rotate(180deg)',
    config: { tension: 300, friction: 10 },
  });

  return (
    <animated.div
      style={{
        ...springProps,
        display: 'inline-flex', // Change to inline-flex
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Icon variant={variant} {...props} />
    </animated.div>
  );
};

export default React.memo(RotatingIcon);
