import React, { FunctionComponent, useEffect, useRef } from 'react';
import { useModal } from '../../../context/ModalContextProvider';
import { cn } from '@libs/utils/react';

export type ModalPosition = 'center' | 'left' | 'right';

interface IModalProps {
  children: React.ReactNode;
  position?: ModalPosition;
  modalClassName?: string;
  backgroundClassName?: string;
  isClosing: boolean;
}

const Modal: FunctionComponent<IModalProps> = ({
  children,
  position = 'center',
  modalClassName = '',
  backgroundClassName = 'aucctus-bg-secondary-solid bg-opacity-20',
  isClosing,
}) => {
  const { closeModal, shouldCloseOnOverlayClick, shouldCloseOnEscape } =
    useModal();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is on an explicitly ignored element
      const isAucctusPortalTarget =
        (event.target as Element)?.closest(
          '[data-aucctus-portal-target="true"]',
        ) ||
        (event.target as Element)?.hasAttribute('data-aucctus-portal-target');

      if (
        shouldCloseOnOverlayClick &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        !isAucctusPortalTarget
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

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && shouldCloseOnEscape) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeModal, shouldCloseOnEscape]);

  const slideAnimations: Record<ModalPosition, string> = {
    center: isClosing ? 'animate-slide-out-center' : 'animate-slide-in-center',
    right: isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right',
    left: isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left',
  };

  const backgroundAnimation = isClosing
    ? 'animate-fade-out'
    : 'animate-fade-in';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex w-full overflow-y-auto overflow-x-hidden',
        backgroundAnimation,
        backgroundClassName,
      )}
    >
      <div
        className={cn(
          'transform cursor-default overflow-hidden',
          position === 'center'
            ? 'm-auto shadow-lg'
            : 'flex w-full items-center',
          position === 'right' && 'justify-end',
          position === 'left' && 'justify-start',
          slideAnimations[position],
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            'aucctus-bg-primary h-full max-h-[100vh]',
            position === 'center' && 'rounded-xl',
            position === 'right' && 'rounded-l-xl',
            position === 'left' && 'rounded-r-xl',
            modalClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
