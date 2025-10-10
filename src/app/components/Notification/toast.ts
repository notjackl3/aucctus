import React from 'react';
import {
  toast as reactToast,
  ToastOptions,
  ToastContent,
  Id,
} from 'react-toastify';
import { cn } from '@libs/utils/react';
import AucctusToast from './AucctusToast';
import ProgressToast from './ProgressToast';
import CompletedToast from './CompletedToast';
import SimpleSuccessToast from './SimpleSuccessToast';
import ErrorToast from './ErrorToast';

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
  position: 'top-right',
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

/**
 * Displays a progress toast with animated hourglass and progress tracking
 * @param title Toast title
 * @param progress Current progress percentage (0-100)
 * @param estimatedTime Estimated completion time in seconds
 * @param onCancel Optional cancel handler
 * @param onEmailMe Optional email notification handler
 * @param emailRequested Whether email has been requested
 * @returns The toast ID
 */
const progress = (
  title: string,
  progress: number,
  estimatedTime?: number,
  onCancel?: () => void,
  onEmailMe?: () => void,
  emailRequested?: boolean,
): Id => {
  return reactToast((props) => React.createElement(ProgressToast, props), {
    ...defaultOptions,
    autoClose: false, // Don't auto-close progress toasts
    closeOnClick: false,
    data: {
      title,
      progress,
      estimatedTime,
      onCancel,
      onEmailMe,
      emailRequested,
    },
  });
};

/**
 * Updates a progress toast with new progress value
 * @param id Toast ID to update
 * @param progress New progress percentage (0-100)
 * @param title Optional new title
 * @param estimatedTime Optional new estimated time
 * @param onCancel Optional cancel handler (preserved from original toast)
 */
const updateProgress = (
  id: Id,
  progress: number,
  title?: string,
  estimatedTime?: number,
  onCancel?: () => void,
): void => {
  reactToast.update(id, {
    render: (props) => React.createElement(ProgressToast, props),
    data: {
      title: title || 'Processing',
      progress,
      estimatedTime,
      onCancel,
    },
  });
};

/**
 * Displays a completed toast with confetti animation and progress bar
 * Use this for operations that had progress tracking
 * @param title Toast title
 * @param description Optional description
 * @param completedTime Time taken to complete in seconds
 * @param onViewNow Optional view action handler
 * @returns The toast ID
 */
const completed = (
  title: string,
  description?: string,
  completedTime?: number,
  onViewNow?: () => void,
): Id => {
  return reactToast((props) => React.createElement(CompletedToast, props), {
    ...defaultOptions,
    autoClose: 5000,
    data: {
      title,
      description,
      completedTime,
      onViewNow,
    },
  });
};

/**
 * Displays a simple success toast with confetti animation (no progress bar)
 * Use this for instant success notifications like "Version Restored"
 * @param title Toast title
 * @param description Optional description
 * @returns The toast ID
 */
const successAnimated = (title: string, description?: string): Id => {
  return reactToast((props) => React.createElement(SimpleSuccessToast, props), {
    ...defaultOptions,
    autoClose: 5000,
    data: {
      title,
      description,
    },
  });
};

/**
 * Displays an error toast with animated error icon
 * @param title Error title
 * @param description Error description
 * @param onRetry Optional retry handler
 * @returns The toast ID
 */
const errorAnimated = (
  title: string,
  description: string,
  onRetry?: () => void,
): Id => {
  return reactToast((props) => React.createElement(ErrorToast, props), {
    ...defaultOptions,
    autoClose: 7000, // Slightly longer for errors
    data: {
      title,
      description,
      onRetry,
    },
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
  // Enhanced toast variants with animations
  progress,
  updateProgress,
  completed,
  successAnimated,
  errorAnimated,
};
