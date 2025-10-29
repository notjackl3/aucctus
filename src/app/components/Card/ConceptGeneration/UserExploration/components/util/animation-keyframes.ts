export const animationStyles = `
  @keyframes moveBackground {
    0% {
      background-position: 0% 0%;
    }
    50% {
      background-position: 50% 100%;
    }
    100% {
      background-position: 0% 0%;
    }
  }

  @keyframes fadeScaleIn {
    from { opacity: 0; transform: scale(0); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes fadeScaleOut {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slideInFromRight {
    from { transform: translateX(25%); }
    to { transform: translateX(0); }
  }

  @keyframes slideOutToRight {
    from { transform: translateX(0); }
    to { transform: translateX(25%); }
  }

  @keyframes slideInFromTop {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
  }

  @keyframes slideInFromBottom {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  @keyframes scaleIn {
    from { transform: scale(0.7); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes fadeSlideToPosition {
    from { 
      opacity: 0; 
      transform: translate(var(--slide-x, 0), var(--slide-y, 0)) scale(0.5);
    }
    to { 
      opacity: 1; 
      transform: translate(0, 0) scale(1);
    }
  }
`;

type keyframes =
  | 'moveBackground'
  | 'fadeScaleIn'
  | 'fadeIn'
  | 'fadeOut'
  | 'fadeScaleOut'
  | 'slideInFromRight'
  | 'slideOutToRight'
  | 'slideInFromTop'
  | 'slideInFromBottom'
  | 'float'
  | 'scaleIn'
  | 'pulse';

const initialAnimationStyleMap: Record<keyframes, React.CSSProperties> = {
  fadeScaleIn: {
    opacity: 0,
    transform: 'scale(0)',
  },
  fadeScaleOut: {
    opacity: 1,
    transform: 'scale(1)',
  },
  fadeIn: {
    opacity: 0,
  },
  fadeOut: {
    opacity: 1,
  },
  moveBackground: {},
  slideInFromRight: {
    transform: 'translateX(25%)',
  },
  slideOutToRight: {
    transform: 'translateX(0)',
  },
  slideInFromTop: {
    transform: 'translateY(-100%)',
  },
  slideInFromBottom: {
    transform: 'translateY(100%)',
  },
  float: {},
  scaleIn: {
    opacity: 0,
    transform: 'scale(0.7)',
  },
  pulse: {},
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
