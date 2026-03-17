import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

import { useRimOrbStyles } from '@hooks/useRimOrbStyles';
import { cn } from '@libs/utils/react';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
type ModalVariant = 'default' | 'danger';

interface LiquidGlassModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when the open state changes
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Modal size:
   * - sm: 400px max-width (compact dialogs, confirmations)
   * - md: 560px max-width (forms, detail views)
   * - lg: 720px max-width (complex content, wizards)
   * - xl: 900px max-width (wide review layouts, multi-column content)
   */
  size?: ModalSize;
  /**
   * Modal variant:
   * - default: Standard styling
   * - danger: Red accent for destructive actions
   */
  variant?: ModalVariant;
  /**
   * Optional title displayed in the header
   */
  title?: string;
  /**
   * Optional description displayed below the title
   */
  description?: string;
  /**
   * Whether to hide the close button
   */
  hideCloseButton?: boolean;
  /**
   * Content to render inside the modal
   */
  children: React.ReactNode;
  /**
   * Additional CSS classes for the content container
   */
  className?: string;
  /**
   * Additional CSS classes for the header section
   */
  headerClassName?: string;
  /**
   * Icon to display next to the title (optional)
   */
  titleIcon?: React.ReactNode;
  /**
   * Enable the animated rim variant with floating gradient orbs
   * and a slowly rotating conic gradient.
   */
  animatedRim?: boolean;
}

/**
 * Size configurations for the modal
 */
const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[900px]',
};

/**
 * Variant-specific styling for the modal
 */
const variantStyles: Record<
  ModalVariant,
  {
    headerBorder: string;
    titleColor: string;
    closeButtonHover: string;
  }
> = {
  default: {
    headerBorder: 'border-b border-gray-light-200 dark:border-gray-dark-700',
    titleColor: 'aucctus-text-primary',
    closeButtonHover: 'hover:bg-gray-light-100 dark:hover:bg-gray-dark-800',
  },
  danger: {
    headerBorder: 'border-b border-error-200 dark:border-error-800',
    titleColor: 'text-error-600 dark:text-error-400',
    closeButtonHover: 'hover:bg-error-50 dark:hover:bg-error-900/30',
  },
};

/**
 * LiquidGlassModal - A modal component with Liquid Glass styling
 *
 * Wraps Radix Dialog with glass morphic overlay and content styling.
 * Supports smooth entrance/exit animations with Framer Motion.
 *
 * @example
 * // Basic usage
 * <LiquidGlassModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Add Widget"
 *   description="Choose a widget type and give it a name"
 * >
 *   <div>Modal content</div>
 * </LiquidGlassModal>
 *
 * @example
 * // Danger variant for delete confirmation
 * <LiquidGlassModal
 *   open={isDeleteOpen}
 *   onOpenChange={setIsDeleteOpen}
 *   variant="danger"
 *   size="sm"
 *   title='Delete "Persona Name"?'
 *   description="This action cannot be undone."
 * >
 *   <DeleteConfirmationContent />
 * </LiquidGlassModal>
 *
 * @example
 * // Large modal without close button
 * <LiquidGlassModal
 *   open={isWizardOpen}
 *   onOpenChange={setIsWizardOpen}
 *   size="lg"
 *   hideCloseButton
 *   title="Create New Persona"
 * >
 *   <MultiStepWizard />
 * </LiquidGlassModal>
 */
const LiquidGlassModal: React.FC<LiquidGlassModalProps> = ({
  open,
  onOpenChange,
  size = 'md',
  variant = 'default',
  title,
  description,
  hideCloseButton = false,
  children,
  className,
  headerClassName,
  titleIcon,
  animatedRim = true,
}) => {
  const styles = variantStyles[variant];
  const distortionId = React.useId().replace(/:/g, '');
  const orbStyles = useRimOrbStyles();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop with glass overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className='glass-modal-overlay fixed inset-0 z-50'
              />
            </Dialog.Overlay>

            {/* Modal content with shell-rim-surface architecture */}
            <Dialog.Content asChild>
              <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{
                    duration: 0.25,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={cn(
                    'w-full',
                    sizeClasses[size],
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
                  )}
                >
                  {/* SVG distortion filter (not used for animated rim to match Overseer's clean style) */}
                  {!animatedRim && (
                    <svg className='absolute h-0 w-0' aria-hidden='true'>
                      <filter id={`distort-${distortionId}`}>
                        <feTurbulence
                          type='fractalNoise'
                          baseFrequency='0.015'
                          numOctaves='3'
                          result='noise'
                        />
                        <feDisplacementMap
                          in='SourceGraphic'
                          in2='noise'
                          scale='6'
                        />
                      </filter>
                    </svg>
                  )}

                  {/* Shell */}
                  <div className='liquid-glass-modal-shell'>
                    {/* Rim (glass ring) */}
                    <div
                      aria-hidden='true'
                      className={cn(
                        'liquid-glass-modal-rim',
                        variant === 'danger' && 'liquid-glass-modal-rim-danger',
                        animatedRim && 'liquid-glass-modal-rim-animated',
                      )}
                      style={
                        !animatedRim
                          ? { filter: `url(#distort-${distortionId})` }
                          : orbStyles
                      }
                    >
                      {animatedRim && (
                        <>
                          <div className='rim-orb rim-orb-1' />
                          <div className='rim-orb rim-orb-2' />
                        </>
                      )}
                    </div>

                    {/* Surface (content plane) */}
                    <div
                      className={cn(
                        'liquid-glass-modal-surface',
                        'max-h-[85vh] overflow-hidden',
                        'flex flex-col',
                        className,
                      )}
                    >
                      <div className='relative z-10 flex flex-1 flex-col overflow-hidden'>
                        {/* Header */}
                        {(title || description || !hideCloseButton) && (
                          <div
                            className={cn(
                              'flex-shrink-0 px-6 py-4',
                              styles.headerBorder,
                              headerClassName,
                            )}
                          >
                            <div className='flex items-start justify-between gap-4'>
                              <div className='flex min-w-0 items-center gap-3'>
                                {titleIcon && (
                                  <div className='flex-shrink-0'>
                                    {titleIcon}
                                  </div>
                                )}
                                <div className='min-w-0'>
                                  {title && (
                                    <Dialog.Title
                                      className={cn(
                                        'aucctus-text-lg-semibold',
                                        styles.titleColor,
                                      )}
                                    >
                                      {title}
                                    </Dialog.Title>
                                  )}
                                  {description && (
                                    <Dialog.Description className='aucctus-text-secondary mt-1 text-sm'>
                                      {description}
                                    </Dialog.Description>
                                  )}
                                </div>
                              </div>

                              {/* Close button */}
                              {!hideCloseButton && (
                                <Dialog.Close asChild>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{
                                      type: 'spring',
                                      stiffness: 400,
                                      damping: 17,
                                    }}
                                    className={cn(
                                      'flex-shrink-0 rounded-md p-1.5',
                                      'transition-colors duration-150',
                                      styles.closeButtonHover,
                                    )}
                                    aria-label='Close'
                                  >
                                    <X
                                      size={16}
                                      className='aucctus-stroke-secondary'
                                    />
                                  </motion.button>
                                </Dialog.Close>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Content area with scroll */}
                        <div className='flex-1 overflow-y-auto'>{children}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

/**
 * LiquidGlassModalFooter - Standard footer component for modal actions
 *
 * @example
 * <LiquidGlassModal>
 *   <div className="p-6">Content</div>
 *   <LiquidGlassModalFooter>
 *     <button onClick={onCancel}>Cancel</button>
 *     <button onClick={onConfirm}>Confirm</button>
 *   </LiquidGlassModalFooter>
 * </LiquidGlassModal>
 */
interface LiquidGlassModalFooterProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Variant affects border color
   */
  variant?: ModalVariant;
}

const LiquidGlassModalFooter: React.FC<LiquidGlassModalFooterProps> = ({
  children,
  className,
  variant = 'default',
}) => {
  const borderColor =
    variant === 'danger'
      ? 'border-t border-error-200 dark:border-error-800'
      : 'border-t border-gray-light-200 dark:border-gray-dark-700';

  return (
    <div
      className={cn(
        'flex-shrink-0 px-6 py-4',
        borderColor,
        'flex items-center justify-end gap-3',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default LiquidGlassModal;
export { LiquidGlassModalFooter };
export type {
  LiquidGlassModalProps,
  LiquidGlassModalFooterProps,
  ModalSize,
  ModalVariant,
};
