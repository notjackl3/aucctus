import React from 'react';
import { createPortal } from 'react-dom';
import { Loading } from '@components';

interface LoadingMaskProps {
  isLoading: boolean;
  zIndex?: number;
  bgOpacity?: number;
}

const LoadingMask: React.FC<LoadingMaskProps> = ({
  isLoading,
  zIndex = 50,
  bgOpacity = 50,
}) => {
  if (!isLoading) return null;

  return createPortal(
    <div
      className={`aucctus-bg-quaternary fixed inset-0 flex animate-fade-in items-center justify-center opacity-0 bg-opacity-${bgOpacity}`}
      style={{ zIndex }}
    >
      <Loading />
    </div>,
    document.body,
  );
};

export default LoadingMask;
