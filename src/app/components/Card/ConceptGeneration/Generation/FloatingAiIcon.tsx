import React from 'react';
import { animated } from '@react-spring/web';
import { Icon } from '@components';
import {
  useFloatingAnimation,
  usePulseAnimation,
} from '@hooks/animation/animation.hook';

interface FloatingAiIconProps {
  showPulse?: boolean;
}

const FloatingAiIcon: React.FC<FloatingAiIconProps> = ({
  showPulse = true,
}) => {
  // Use custom animation hooks instead of direct useSpring
  const floatingAnimation = useFloatingAnimation({
    amplitude: 3,
    duration: 1500,
    delay: 0,
  });

  const echoAnimation = usePulseAnimation({
    startScale: 1,
    endScale: 2,
    startOpacity: 0.3,
    endOpacity: 0,
    duration: 1000,
    delay: 1000,
  });

  return (
    <>
      {showPulse && (
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
      )}
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

export default FloatingAiIcon;
