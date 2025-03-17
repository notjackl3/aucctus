import React, { useCallback } from 'react';

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
  const progress =
    currentStep === Infinity ? 100 : (currentStep / totalSteps) * 100;

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
