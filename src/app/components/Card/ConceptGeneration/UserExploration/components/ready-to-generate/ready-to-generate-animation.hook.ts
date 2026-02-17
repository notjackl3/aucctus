export const useReadyToGenerateAnimations = (compact: boolean) => {
  const iconAnimation = {
    initial: { opacity: 0, maxHeight: '0px', transform: 'translateY(20px)' },
    animate: { opacity: 1, maxHeight: '1000px', transform: 'translateY(0px)' },
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
      mass: 0.5,
    },
  };

  const labelAnimation = {
    initial: { opacity: 0, transform: 'translateY(20px) rotate(-3deg)' },
    animate: { opacity: 1, transform: 'translateY(0px) rotate(0deg)' },
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
      mass: 0.5,
    },
  };

  const cardAnimation = {
    initial: false as const,
    animate: {
      opacity: compact ? 0 : 1,
      maxHeight: compact ? '0px' : '500px',
      transform: compact ? 'scale(0.5)' : 'scale(1)',
      transformOrigin: 'top',
    },
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
      mass: 0.5,
    },
  };

  const headerButtonAnimation = {
    initial: false as const,
    animate: {
      opacity: !compact ? 0 : 1,
    },
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
      mass: 0.5,
      delay: 0.5,
    },
  };

  return {
    iconAnimation,
    labelAnimation,
    cardAnimation,
    headerButtonAnimation,
  };
};
