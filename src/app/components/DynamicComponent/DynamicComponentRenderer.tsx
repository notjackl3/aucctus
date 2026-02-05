import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Icon, Loading } from '@components';
import { cn } from '@libs/utils/react';
import { executeWithScope, validateComponent } from './scopeRegistry';

/**
 * Props for the DynamicComponentRenderer
 */
export interface DynamicComponentRendererProps {
  /**
   * URL to fetch the compiled component JavaScript from
   * The endpoint should return the compiled JS code as text
   */
  componentUrl?: string;

  /**
   * Alternatively, provide the compiled code directly
   * Takes precedence over componentUrl if both are provided
   */
  compiledCode?: string;

  /**
   * Component ID for caching and identification
   */
  componentId?: string;

  /**
   * Props to pass to the dynamically loaded component
   */
  componentProps?: Record<string, unknown>;

  /**
   * Callback when component loads successfully
   */
  onLoad?: () => void;

  /**
   * Callback when component fails to load
   */
  onError?: (error: Error) => void;

  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;

  /**
   * Custom error component
   */
  errorComponent?: React.ReactNode;

  /**
   * Whether to show a retry button on error
   * @default true
   */
  showRetry?: boolean;

  /**
   * Additional CSS classes for the container
   */
  className?: string;

  /**
   * Whether to animate the entrance
   * @default true
   */
  animate?: boolean;
}

/**
 * Loading state for the component
 */
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * DynamicComponentRenderer
 *
 * Renders React components that have been compiled by the agent-side compiler.
 * Handles fetching, execution, and error states with beautiful Aucctus styling.
 *
 * @example
 * ```tsx
 * // From URL
 * <DynamicComponentRenderer
 *   componentUrl="/api/components/competitive-landscape"
 *   componentId="competitive-landscape"
 *   onLoad={() => console.log('Loaded!')}
 * />
 *
 * // From compiled code directly
 * <DynamicComponentRenderer
 *   compiledCode={preloadedCode}
 *   componentId="my-component"
 * />
 * ```
 */
export const DynamicComponentRenderer: React.FC<
  DynamicComponentRendererProps
> = ({
  componentUrl,
  compiledCode: providedCode,
  componentId,
  componentProps = {},
  onLoad,
  onError,
  loadingComponent,
  errorComponent,
  showRetry = true,
  className,
  animate = true,
}) => {
  const [state, setState] = useState<LoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [Component, setComponent] = useState<React.FC | null>(null);
  const [loadTime, setLoadTime] = useState<number>(0);
  const mountedRef = useRef(true);
  const loadStartRef = useRef<number>(0);

  // Use refs for callbacks to avoid triggering reloads when they change
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);
  onLoadRef.current = onLoad;
  onErrorRef.current = onError;

  // Track the last loaded code to prevent unnecessary reloads
  const lastLoadedCodeRef = useRef<string | null>(null);

  /**
   * Load and execute the component
   */
  const loadComponent = useCallback(
    async (forceReload = false) => {
      if (!componentUrl && !providedCode) {
        setError(
          new Error('Either componentUrl or compiledCode must be provided'),
        );
        setState('error');
        return;
      }

      // Skip reload if the code hasn't changed (prevents flash on callback changes)
      if (
        !forceReload &&
        providedCode &&
        lastLoadedCodeRef.current === providedCode
      ) {
        return;
      }

      setState('loading');
      setError(null);
      loadStartRef.current = Date.now();

      try {
        let code: string;

        if (providedCode) {
          // Use provided code directly
          code = providedCode;
        } else if (componentUrl) {
          // Fetch from URL
          const response = await fetch(componentUrl);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch component: ${response.status} ${response.statusText}`,
            );
          }

          code = await response.text();
        } else {
          throw new Error('No component source provided');
        }

        // Validate before execution
        const validation = validateComponent(code);
        if (!validation.isValid) {
          throw new Error(`Invalid component: ${validation.error}`);
        }

        // Execute the component
        const LoadedComponent = executeWithScope(code);

        if (!mountedRef.current) return;

        // Track successfully loaded code (use actual code, not just providedCode)
        lastLoadedCodeRef.current = code;

        setComponent(() => LoadedComponent);
        setState('success');
        setLoadTime(Date.now() - loadStartRef.current);
        onLoadRef.current?.();
      } catch (err) {
        if (!mountedRef.current) return;

        const error =
          err instanceof Error
            ? err
            : new Error('Unknown error loading component');
        setError(error);
        setState('error');
        onErrorRef.current?.(error);
        // Error is captured in state and displayed to user
      }
    },
    [componentUrl, providedCode],
  );

  /**
   * Load on mount or when source changes
   */
  useEffect(() => {
    mountedRef.current = true;
    loadComponent();

    return () => {
      mountedRef.current = false;
    };
  }, [loadComponent]);

  /**
   * Retry handler - force reload even if code hasn't changed
   */
  const handleRetry = useCallback(() => {
    lastLoadedCodeRef.current = null; // Clear cache to force reload
    loadComponent(true);
  }, [loadComponent]);

  /**
   * Memoized component instance
   */
  const renderedComponent = useMemo(() => {
    if (!Component) return null;

    try {
      return <Component {...componentProps} />;
    } catch (err) {
      // Runtime render error - captured and displayed via error state
      setError(
        err instanceof Error ? err : new Error('Component render failed'),
      );
      setState('error');
      return null;
    }
  }, [Component, componentProps]);

  // Loading state
  if (state === 'loading' || state === 'idle') {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div
        className={cn(
          'flex min-h-[400px] flex-col items-center justify-center rounded-xl p-8',
          'aucctus-bg-secondary aucctus-border-secondary border',
          'animate-in fade-in duration-300',
          className,
        )}
      >
        <div className='relative mb-6'>
          {/* Animated rings */}
          <div className='aucctus-bg-brand-primary absolute inset-0 animate-ping rounded-full opacity-20' />
          <div
            className='aucctus-bg-brand-primary absolute inset-0 animate-ping rounded-full opacity-10'
            style={{ animationDelay: '150ms' }}
          />
          <div className='aucctus-bg-brand-primary relative flex h-16 w-16 items-center justify-center rounded-full'>
            <Loading className='h-8 w-8' />
          </div>
        </div>

        <div className='text-center'>
          <h3 className='aucctus-header-sm-semibold aucctus-text-primary mb-2'>
            Loading Component
          </h3>
          <p className='aucctus-text-sm aucctus-text-tertiary'>
            {componentId
              ? `Loading ${componentId}...`
              : 'Compiling and rendering...'}
          </p>
        </div>

        {/* Animated progress dots */}
        <div className='mt-6 flex gap-1.5'>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className='aucctus-bg-brand-solid h-2 w-2 animate-pulse rounded-full'
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <div
        className={cn(
          'flex min-h-[400px] flex-col items-center justify-center rounded-xl p-8',
          'aucctus-bg-error-subtle aucctus-border-error border',
          'animate-in fade-in slide-in-from-bottom-4 duration-500',
          className,
        )}
      >
        <div className='aucctus-bg-error-secondary mb-6 flex h-16 w-16 items-center justify-center rounded-full'>
          <Icon
            variant='alert-triangle'
            className='aucctus-stroke-error-primary h-8 w-8'
          />
        </div>

        <div className='text-center'>
          <h3 className='aucctus-header-sm-semibold aucctus-text-error-primary mb-2'>
            Failed to Load Component
          </h3>
          <p className='aucctus-text-sm aucctus-text-secondary mb-2 max-w-md'>
            {error?.message ||
              'An unknown error occurred while loading the component.'}
          </p>
          {componentId && (
            <p className='aucctus-text-xs aucctus-text-tertiary'>
              Component ID: {componentId}
            </p>
          )}
        </div>

        {showRetry && (
          <button
            onClick={handleRetry}
            className={cn(
              'mt-6 flex items-center gap-2 rounded-lg px-4 py-2.5',
              'aucctus-bg-error-solid aucctus-text-white',
              'transition-all duration-200',
              'hover:aucctus-bg-error-solid-hover hover:scale-105',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
            )}
          >
            <Icon variant='refresh' className='h-4 w-4 stroke-white' />
            <span className='aucctus-text-sm-semibold'>Retry</span>
          </button>
        )}

        {/* Error details (collapsible) */}
        <details className='mt-6 w-full max-w-lg'>
          <summary className='aucctus-text-xs aucctus-text-tertiary hover:aucctus-text-secondary cursor-pointer transition-colors'>
            Technical Details
          </summary>
          <pre className='aucctus-bg-primary aucctus-text-xs aucctus-text-tertiary mt-2 overflow-x-auto rounded-lg p-4'>
            {error?.stack ||
              error?.message ||
              'No additional details available'}
          </pre>
        </details>
      </div>
    );
  }

  // Success state - render the component
  return (
    <div
      className={cn(
        animate && 'animate-in fade-in slide-in-from-bottom-2 duration-500',
        className,
      )}
    >
      {/* Development info badge */}
      {process.env.NODE_ENV === 'development' && loadTime > 0 && (
        <div className='mb-2 flex items-center justify-end gap-2'>
          <div className='aucctus-bg-success-subtle flex items-center gap-1.5 rounded-full px-3 py-1'>
            <Icon
              variant='check-circle-broken'
              className='aucctus-stroke-success-primary h-3.5 w-3.5'
            />
            <span className='aucctus-text-xs aucctus-text-success-primary'>
              Loaded in {loadTime}ms
            </span>
          </div>
          {componentId && (
            <div className='aucctus-bg-secondary flex items-center gap-1.5 rounded-full px-3 py-1'>
              <Icon
                variant='cube'
                className='aucctus-stroke-tertiary h-3.5 w-3.5'
              />
              <span className='aucctus-text-xs aucctus-text-tertiary'>
                {componentId}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error boundary wrapper */}
      <DynamicComponentErrorBoundary
        onError={(err) => {
          setError(err);
          setState('error');
          onError?.(err);
        }}
      >
        {renderedComponent}
      </DynamicComponentErrorBoundary>
    </div>
  );
};

/**
 * Error boundary for catching render errors in dynamic components
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class DynamicComponentErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    // Error boundary caught a render error - propagate to parent
    this.props.onError(error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return null; // Parent will show error state
    }

    return this.props.children;
  }
}

export default DynamicComponentRenderer;
