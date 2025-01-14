import React, { FunctionComponent, useEffect, useRef } from 'react';
import { useModal } from '../../../context/ModalContextProvider';
import { cn } from '@libs/utils/react';

export type ModalPosition = 'center' | 'left' | 'right';

interface IModalProps {
  children: React.ReactNode;
  position?: ModalPosition;
}

const Modal: FunctionComponent<IModalProps> = ({
  children,
  position = 'center',
}) => {
  const { closeModal, shouldCloseOnOverlayClick } = useModal();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shouldCloseOnOverlayClick &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    if (shouldCloseOnOverlayClick) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      if (shouldCloseOnOverlayClick) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [closeModal, shouldCloseOnOverlayClick]);

  // Determine classes based on position prop
  const positionClasses = {
    center: 'm-auto animate-slide-in-center',
    right: 'flex items-center justify-end animate-slide-in-right',
    left: 'flex items-center justify-start animate-slide-in-left',
  };

  return (
    <div className='fixed inset-0 z-50 flex w-full overflow-y-auto bg-black bg-opacity-50'>
      {/* If position is center set m-auto and rounded/shadow.
      If not center than make w-full so flex can position correctly */}
      <div
        className={cn(
          'transform cursor-default',
          position === 'center'
            ? 'm-auto rounded-lg shadow-lg'
            : `${positionClasses[position]} w-full`,
        )}
      >
        <div ref={contentRef} className='h-full bg-white'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
