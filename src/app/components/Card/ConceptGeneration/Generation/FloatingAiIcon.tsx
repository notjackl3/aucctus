import React from 'react';
import { motion } from 'framer-motion';
import {
  useFloatingAnimation,
  usePulseAnimation,
} from '@hooks/animation/animation.hook';
import { Sparkles } from 'lucide-react';

interface FloatingAiIconProps {
  showPulse?: boolean;
}

const FloatingAiIcon: React.FC<FloatingAiIconProps> = ({
  showPulse = true,
}) => {
  // Use custom animation hooks instead of direct useSpring
  const floatingAnimation = useFloatingAnimation({
    amplitude: 3,
    duration: 1.5,
    delay: 0,
  });

  const echoAnimation = usePulseAnimation({
    startScale: 1,
    endScale: 2,
    startOpacity: 0.3,
    endOpacity: 0,
    duration: 1,
    delay: 1,
  });

  return (
    <>
      {showPulse && (
        <motion.div
          className='aucctus-bg-primary-solid absolute rounded-lg border-[1.5px] border-primary-300 border-opacity-50 p-2'
          {...echoAnimation}
        >
          <Sparkles size={24} className='stroke-primary-100 opacity-30' />
        </motion.div>
      )}
      <motion.div
        className='aucctus-bg-primary-solid rounded-lg border-[1.5px] border-primary-300 border-opacity-50 p-2'
        {...floatingAnimation}
      >
        <Sparkles size={24} className='stroke-primary-100' />
      </motion.div>
    </>
  );
};

export default FloatingAiIcon;
