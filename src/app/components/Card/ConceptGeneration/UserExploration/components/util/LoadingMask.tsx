import React from 'react';
import { createPortal } from 'react-dom';
import { Loading } from '@components';

interface LoadingMaskProps {
  isLoading: boolean;
  message?: string;
  zIndex?: number;
  bgOpacity?: number;
}

const LoadingMask: React.FC<LoadingMaskProps> = ({
  isLoading,
  message,
  zIndex = 50,
  bgOpacity = 50,
}) => {
  if (!isLoading) return null;

  return createPortal(
    <div
      className={`aucctus-bg-quaternary fixed inset-0 flex animate-fade-in flex-col items-center justify-center gap-4 opacity-0 bg-opacity-${bgOpacity}`}
      style={{ zIndex }}
    >
      <Loading />
      {message && (
        <p className='aucctus-text-tertiary aucctus animate-fade-oscillation'>
          {message}
        </p>
      )}
    </div>,
    document.body,
  );
};

export default LoadingMask;
