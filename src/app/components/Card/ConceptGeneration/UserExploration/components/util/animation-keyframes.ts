export const animationStyles = `
  @keyframes moveBackground {
    0% {
      background-position: 0% 0%;
    }
    50% {
      background-position: 100% 100%;
    }
    100% {
      background-position: 0% 0%;
    }
  }

  @keyframes fadeScaleIn {
    from { opacity: 0; transform: scale(0); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

type keyframes = 'moveBackground' | 'fadeScaleIn' | 'fadeIn' | 'fadeOut';

const initialAnimationStyleMap: Record<keyframes, React.CSSProperties> = {
  fadeScaleIn: {
    opacity: 0,
    transform: 'scale(0)',
  },
  fadeIn: {
    opacity: 0,
  },
  fadeOut: {
    opacity: 1,
  },
  moveBackground: {},
};

export const getAnimationStyle = (
  animation: keyframes,
  duration: number,
  delay: number = 0,
) => {
  return {
    ...initialAnimationStyleMap[animation],
    animation: `${animation} ${duration}ms ease-out forwards`,
    animationDelay: `${delay}ms`,
  };
};
