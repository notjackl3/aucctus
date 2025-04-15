import {
  toast as reactToast,
  ToastOptions,
  ToastContent,
  Id,
} from 'react-toastify';
import { cn } from '@libs/utils/react';
import AucctusToast from './AucctusToast';

/**
 * Toast type definitions for the application
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Extended toast options with Aucctus styling
 */
interface AucctusToastOptions extends ToastOptions {
  type?: ToastType;
}

/**
 * Default toast configuration
 */
const defaultOptions: ToastOptions = {
  position: 'top-center',
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Applies Aucctus theme styling to toast notifications
 */
const getToastClassName = (type?: ToastType) => {
  return cn(
    'aucctus-bg-primary aucctus-text-primary aucctus-border-primary rounded-md shadow-md',
    {
      'aucctus-bg-success-subtle aucctus-border-success': type === 'success',
      'aucctus-bg-error-subtle aucctus-border-error': type === 'error',
      'aucctus-bg-warning-subtle aucctus-border-warning': type === 'warning',
      'aucctus-bg-brand-subtle aucctus-border-brand': type === 'info',
    },
  );
};

/**
 * Displays a toast notification with Aucctus styling
 */
const show = (content: ToastContent, options?: AucctusToastOptions): Id => {
  const { type, ...restOptions } = options || {};

  const toastOptions: ToastOptions = {
    ...defaultOptions,
    ...restOptions,
    className: cn(getToastClassName(type), options?.className),
  };

  switch (type) {
    case 'success':
      return reactToast.success(content, toastOptions);
    case 'error':
      return reactToast.error(content, toastOptions);
    case 'warning':
      return reactToast.warning(content, toastOptions);
    case 'info':
      return reactToast.info(content, toastOptions);
    default:
      return reactToast(content, toastOptions);
  }
};

/**
 * Displays a success toast notification using the Toast component
 * @param message Primary message or Toast component
 * @param secondaryMessage Optional secondary message
 * @param options Additional toast options
 * @returns The toast ID
 */
const success = (
  message: string | ToastContent,
  secondaryMessage?: string,
  options?: Omit<AucctusToastOptions, 'type'>,
): Id => {
  if (typeof message === 'string') {
    return reactToast(AucctusToast, {
      ...defaultOptions,
      ...options,
      data: {
        primaryMessage: message,
        secondaryMessage,
        status: 'success',
      },
    });
  }
  return show(message, { ...options, type: 'success' });
};

/**
 * Displays an error toast notification using the Toast component
 * @param message Primary message or Toast component
 * @param secondaryMessage Optional secondary message
 * @param options Additional toast options
 * @returns The toast ID
 */
const error = (
  message: string | ToastContent,
  secondaryMessage?: string,
  options?: Omit<AucctusToastOptions, 'type'>,
): Id => {
  if (typeof message === 'string') {
    return reactToast(AucctusToast, {
      ...defaultOptions,
      ...options,
      data: {
        primaryMessage: message,
        secondaryMessage,
        status: 'alert',
      },
    });
  }
  return show(message, { ...options, type: 'error' });
};

/**
 * Displays an info toast notification using the Toast component
 * @param message Primary message or Toast component
 * @param secondaryMessage Optional secondary message
 * @param options Additional toast options
 * @returns The toast ID
 */
const info = (
  message: string | ToastContent,
  secondaryMessage?: string,
  options?: Omit<AucctusToastOptions, 'type'>,
): Id => {
  if (typeof message === 'string') {
    return reactToast(AucctusToast, {
      ...defaultOptions,
      ...options,
      data: {
        primaryMessage: message,
        secondaryMessage,
        status: 'success',
      },
    });
  }
  return show(message, { ...options, type: 'info' });
};

/**
 * Displays a warning toast notification using the Toast component
 * @param message Primary message or Toast component
 * @param secondaryMessage Optional secondary message
 * @param options Additional toast options
 * @returns The toast ID
 */
const warning = (
  message: string | ToastContent,
  secondaryMessage?: string,
  options?: Omit<AucctusToastOptions, 'type'>,
): Id => {
  if (typeof message === 'string') {
    return reactToast(AucctusToast, {
      ...defaultOptions,
      ...options,
      data: {
        primaryMessage: message,
        secondaryMessage,
        status: 'warning',
      },
    });
  }
  return show(message, { ...options, type: 'warning' });
};

/**
 * Dismisses a specific toast by ID
 */
const dismiss = (id?: Id): void => {
  if (id) {
    reactToast.dismiss(id);
  }
};

/**
 * Dismisses all active toasts
 */
const dismissAll = (): void => {
  reactToast.dismiss();
};

/**
 * Updates an existing toast notification
 */
const update = (
  id: Id,
  content: ToastContent,
  options?: AucctusToastOptions,
): void => {
  const { type, ...restOptions } = options || {};

  const toastOptions: ToastOptions = {
    ...restOptions,
    className: cn(getToastClassName(type), options?.className),
  };

  reactToast.update(id, {
    render: content,
    ...toastOptions,
  });
};

export const toast = {
  show,
  success,
  error,
  info,
  warning,
  dismiss,
  dismissAll,
  update,
};
