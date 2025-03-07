import React from 'react';
import { createPortal } from 'react-dom';

export const PointerEventMask = ({ showMask }: { showMask: boolean }) => {
  if (!showMask) return null;

  return createPortal(
    <div className='pointer-events-auto fixed inset-0 z-[9999] bg-transparent' />,
    document.body,
  );
};
