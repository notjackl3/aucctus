import { useSpring } from '@react-spring/web';

export const useReadyToGenerateAnimations = (compact: boolean) => {
  const iconAnimation = useSpring({
    from: { opacity: 0, maxHeight: '0px', transform: 'translateY(20px)' },
    to: { opacity: 1, maxHeight: '1000px', transform: 'translateY(0px)' },
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
    to: {
      opacity: compact ? 0 : 1,
      maxHeight: compact ? '0px' : '1000px',
      transform: compact ? 'scale(0.5)' : 'scale(1)',
      transformOrigin: 'top',
    },
    config: {
      tension: 100,
      friction: 12,
      mass: 0.5,
    },
  });

  const headerButtonAnimation = useSpring({
    opacity: !compact ? 0 : 1,
    config: {
      tension: 100,
      friction: 12,
      mass: 0.5,
    },
    delay: 1000,
  });

  return {
    iconAnimation,
    labelAnimation,
    cardAnimation,
    headerButtonAnimation,
  };
};
