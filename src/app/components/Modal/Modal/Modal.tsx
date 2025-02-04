import React, {
  FunctionComponent,
  useEffect,
  useRef,
  useCallback,
} from 'react';
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
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shouldCloseOnOverlayClick &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        handleCloseModal();
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

  const handleCloseModal = useCallback(() => {
    if (!wrapperRef.current) return;

    switch (position) {
      case 'right':
        wrapperRef.current.classList.add('animate-slide-out-right');
        wrapperRef.current.addEventListener('animationend', closeModal, {
          once: true,
        });
        break;
      case 'left':
        wrapperRef.current.classList.add('animate-slide-out-left');
        wrapperRef.current.addEventListener('animationend', closeModal, {
          once: true,
        });
        break;
      default:
        closeModal();
        break;
    }
  }, [closeModal, position]);

  // Determine classes based on position prop

  const positionClasses = {
    center: 'animate-slide-in-center',
    right: 'flex items-center justify-end animate-slide-in-right',
    left: 'flex items-center justify-start animate-slide-in-left',
  };

  const contentClasses = {
    center: 'rounded-xl',
    right: 'rounded-l-xl',
    left: 'rounded-r-xl',
  };

  return (
    <div className='fixed inset-0 z-50 flex w-full overflow-y-auto overflow-x-hidden bg-black bg-opacity-50'>
      {/* If position is center set m-auto and rounded/shadow.
      If not center than make w-full so flex can position correctly */}
      <div
        ref={wrapperRef}
        className={cn(
          'transform cursor-default overflow-hidden',
          position === 'center'
            ? 'm-auto shadow-lg'
            : `${positionClasses[position]} w-full`,
        )}
      >
        <div
          ref={contentRef}
          className={`h-full bg-white ${contentClasses[position]}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
