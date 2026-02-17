export const useContinueRefiningAnimations = () => {
  const iconAnimation = {
    initial: { opacity: 0, maxHeight: '0px', transform: 'translateY(20px)' },
    animate: { opacity: 1, maxHeight: '200px', transform: 'translateY(0px)' },
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
    initial: {
      opacity: 0,
      maxHeight: '0px',
      transform: 'scale(0.5)',
      transformOrigin: 'top',
    },
    animate: {
      opacity: 1,
      maxHeight: '2000px',
      transform: 'scale(1)',
      transformOrigin: 'top',
    },
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
      mass: 0.5,
    },
  };

  return {
    iconAnimation,
    labelAnimation,
    cardAnimation,
  };
};
