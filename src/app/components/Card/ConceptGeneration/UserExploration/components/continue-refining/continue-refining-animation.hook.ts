import { useSpring } from '@react-spring/web';

export const useContinueRefiningAnimations = () => {
  const iconAnimation = useSpring({
    from: { opacity: 0, maxHeight: '0px', transform: 'translateY(20px)' },
    to: { opacity: 1, maxHeight: '200px', transform: 'translateY(0px)' },
    config: {
      tension: 100,
      friction: 12,
      mass: 0.5,
    },
  });

  const labelAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px) rotate(-3deg)' },
    to: { opacity: 1, transform: 'translateY(0px) rotate(0deg)' },
    config: {
      offset: 100,
      tension: 100,
      friction: 12,
      mass: 0.5,
    },
  });

  const cardAnimation = useSpring({
    from: {
      opacity: 0,
      maxHeight: '0px',
      transform: 'scale(0.5)',
      transformOrigin: 'top',
    },
    to: {
      opacity: 1,
      maxHeight: '2000px',
      transform: 'scale(1)',
      transformOrigin: 'top',
    },
    config: {
      tension: 100,
      friction: 12,
      mass: 0.5,
    },
  });

  return {
    iconAnimation,
    labelAnimation,
    cardAnimation,
  };
};
