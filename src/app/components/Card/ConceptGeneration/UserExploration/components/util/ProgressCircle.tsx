import React, { useEffect, useCallback } from 'react';

interface ProgressCircleProps {
  currentStep: number;
  totalSteps: number;
  size?: string;
  className?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  className,
  currentStep,
  totalSteps,
  size = '1.5rem',
}) => {
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (CSS && 'registerProperty' in CSS) {
      try {
        // @ts-ignore - TypeScript might not recognize this API
        CSS.registerProperty({
          name: '--incubationProgress',
          syntax: '<percentage>',
          initialValue: '0%',
          inherits: false,
        });
      } catch (e) {
        // Property might already be registered or browser doesn't support it
        console.log('CSS Property registration error:', e);
      }
    }

    // Add the keyframes animation to the document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes progressAnimation { to { --incubationProgress: 100% } }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const getCircularProgressStyle = useCallback(() => {
    return {
      width: size,
      height: size,
      aspectRatio: 1,
      borderRadius: '50%',
      borderStyle: 'solid',
      background: 'hsla(180, 100%, 100%, .0)',
      mask: `conic-gradient(red var(--incubationProgress, ${progress}%), transparent 0%) border-box`,
      animation: 'none',
      '--incubationProgress': `${progress}%`,
      transition: '--incubationProgress 0.3s ease',
    };
  }, [progress, size]);

  return <div style={getCircularProgressStyle()} className={className}></div>;
};

export default ProgressCircle;
