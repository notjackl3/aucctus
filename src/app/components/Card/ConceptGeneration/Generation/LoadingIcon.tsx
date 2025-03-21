import React from 'react';
import { animated, easings, useSpring } from '@react-spring/web';
import { Icon } from '@components';

const LoadingIcon: React.FC = () => {
  // Animation configurations
  const floatingAnimation = useSpring({
    from: { transform: 'translateY(3px)' },
    to: { transform: 'translateY(-3px)' },
    config: {
      duration: 1500,
      easing: easings.easeInOutSine,
    },
    loop: { reverse: true },
  });

  const echoAnimation = useSpring({
    from: { transform: 'scale(1)', opacity: 0.3 },
    to: { transform: 'scale(2)', opacity: 0 },
    config: {
      duration: 1000,
      easing: easings.easeInOutSine,
    },
    loop: true,
    delay: 1000,
  });

  return (
    <>
      <animated.div
        className='aucctus-bg-primary-solid absolute rounded-lg border-[1.5px] border-primary-300 border-opacity-50 p-2'
        style={echoAnimation}
      >
        <Icon
          variant='ai-conclusion'
          className='stroke-primary-100 opacity-30'
          width={24}
          height={24}
        />
      </animated.div>
      <animated.div
        className='aucctus-bg-primary-solid rounded-lg border-[1.5px] border-primary-300 border-opacity-50 p-2'
        style={floatingAnimation}
      >
        <Icon
          variant='ai-conclusion'
          className='stroke-primary-100'
          width={24}
          height={24}
        />
      </animated.div>
    </>
  );
};

export default LoadingIcon;
