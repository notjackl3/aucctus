import { useRimOrbStyles } from '@hooks/useRimOrbStyles';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { useModal } from '../../../context/ModalContextProvider';

export type ModalPosition = 'center' | 'left' | 'right';
export type ModalVariant = 'default' | 'danger';

interface IModalProps {
  children: React.ReactNode;
  position?: ModalPosition;
  variant?: ModalVariant;
  modalClassName?: string;
  backgroundClassName?: string;
  isClosing: boolean;
}

const Modal: FunctionComponent<IModalProps> = ({
  children,
  position = 'center',
  variant = 'default',
  modalClassName = '',
  backgroundClassName,
  isClosing,
}) => {
  const { closeModal, shouldCloseOnOverlayClick, shouldCloseOnEscape } =
    useModal();
  const contentRef = useRef<HTMLDivElement>(null);
  const orbStyles = useRimOrbStyles();

  const isCenter = position === 'center';

  const defaultBgClass = isCenter
    ? 'glass-modal-overlay'
    : 'aucctus-bg-secondary-solid bg-opacity-20';

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
    center: '',
    right: isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right',
    left: isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left',
  };

  if (isCenter) {
    return (
      <div className='fixed inset-0 z-50 overflow-hidden'>
        {/* Overlay — sibling to content so its backdrop-filter doesn't
            ancestor-wrap the rim's backdrop-filter (matches LiquidGlassModal) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isClosing ? 0 : 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'absolute inset-0',
            backgroundClassName ?? defaultBgClass,
          )}
        />

        {/* Content */}
        <div className='relative flex h-full w-full items-center justify-center'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{
              opacity: isClosing ? 0 : 1,
              scale: isClosing ? 0.95 : 1,
              y: isClosing ? 20 : 0,
            }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className='m-auto cursor-default'
          >
            {/* Shell */}
            <div className='liquid-glass-modal-shell'>
              {/* Rim */}
              <div
                aria-hidden='true'
                className={cn(
                  'liquid-glass-modal-rim',
                  variant === 'danger' && 'liquid-glass-modal-rim-danger',
                  variant !== 'danger' && 'liquid-glass-modal-rim-animated',
                )}
                style={variant !== 'danger' ? orbStyles : undefined}
              >
                {variant !== 'danger' && (
                  <>
                    <div className='rim-orb rim-orb-1' />
                    <div className='rim-orb rim-orb-2' />
                  </>
                )}
              </div>

              {/* Surface */}
              <div
                ref={contentRef}
                className={cn(
                  'liquid-glass-modal-surface max-h-[90vh] overflow-hidden',
                  modalClassName,
                )}
              >
                <div className='h-full overflow-y-auto'>{children}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const backgroundAnimation = isClosing
    ? 'animate-fade-out'
    : 'animate-fade-in';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex w-full overflow-hidden',
        backgroundAnimation,
        backgroundClassName ?? defaultBgClass,
      )}
    >
      <div
        className={cn(
          'flex w-full transform cursor-default items-center',
          position === 'right' && 'justify-end',
          position === 'left' && 'justify-start',
          slideAnimations[position],
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            'max-h-[90vh] overflow-y-auto',
            position === 'right' && 'h-full rounded-l-lg',
            position === 'left' && 'h-full rounded-r-lg',
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
