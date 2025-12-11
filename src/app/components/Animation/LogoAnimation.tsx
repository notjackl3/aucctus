import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { cn } from '@libs/utils/react';

export interface LogoAnimationRef {
  /** Start playing the animation */
  play: () => void;
  /** Pause the animation */
  pause: () => void;
  /** Reset to first frame */
  reset: () => void;
  /** Reset and play from beginning */
  restart: () => void;
  /** Whether animation is currently playing */
  isPlaying: boolean;
  /** Whether all frames are loaded */
  isLoaded: boolean;
}

export interface LogoAnimationProps {
  /** Width and height of the animation container */
  size?: number;
  /** Frames per second (default: 45) */
  fps?: number;
  /** Whether to loop the animation (default: false) */
  loop?: boolean;
  /** Ping-pong mode: play forward then reverse (0→end→0→end...) (default: true) */
  pingPong?: boolean;
  /** Delay in ms before restarting loop when animation returns to frame 0 (default: 1000) */
  loopDelay?: number;
  /** Whether to autoplay on load (default: true) */
  autoPlay?: boolean;
  /** Show play/pause/restart controls (default: false) */
  showControls?: boolean;
  /** Callback when animation completes (only fires if loop is false) */
  onComplete?: () => void;
  /** Callback when all frames are loaded */
  onLoad?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Generate frame paths - frames go from 00004 to 00183 (180 total frames)
const FRAME_PATHS = Array.from(
  { length: 180 },
  (_, i) =>
    `/animation-keyframes/logo-200/2500x2500Aucctus_Logo_Animation_INTRO_${String(i + 4).padStart(5, '0')}.png`,
);

const TOTAL_FRAMES = FRAME_PATHS.length;

/**
 * Animated Aucctus logo component that plays a PNG sequence animation.
 *
 * @example
 * ```tsx
 * // Basic usage - plays forward then reverse (ping-pong) by default
 * <LogoAnimation size={200} fps={30} onComplete={() => console.log('done!')} />
 *
 * // Looping ping-pong animation (0→end→0→end→...)
 * <LogoAnimation size={200} loop />
 *
 * // Forward-only loop (no reverse)
 * <LogoAnimation size={200} loop pingPong={false} />
 *
 * // With controls
 * <LogoAnimation size={200} showControls />
 *
 * // With ref for programmatic control
 * const animRef = useRef<LogoAnimationRef>(null);
 * <LogoAnimation ref={animRef} autoPlay={false} />
 * <button onClick={() => animRef.current?.play()}>Play</button>
 * ```
 */
const LogoAnimation = forwardRef<LogoAnimationRef, LogoAnimationProps>(
  (
    {
      size = 200,
      fps = 45,
      loop = false,
      pingPong = true,
      loopDelay = 1000,
      autoPlay = true,
      showControls = false,
      onComplete,
      onLoad,
      className,
    },
    ref,
  ) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDelaying, setIsDelaying] = useState(false);

    const imagesRef = useRef<HTMLImageElement[]>([]);
    const frameRef = useRef(0);
    const lastFrameTimeRef = useRef(0);
    const animationIdRef = useRef<number | null>(null);
    const directionRef = useRef<1 | -1>(1); // 1 = forward, -1 = reverse
    const delayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const frameDuration = useMemo(() => 1000 / fps, [fps]);

    // Preload all images
    useEffect(() => {
      let loadedCount = 0;
      const images: HTMLImageElement[] = [];

      const handleLoad = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));

        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setIsLoaded(true);
          onLoad?.();
          if (autoPlay) {
            setIsPlaying(true);
          }
        }
      };

      FRAME_PATHS.forEach((path, index) => {
        const img = new Image();
        img.src = path;
        img.onload = handleLoad;
        img.onerror = handleLoad; // Count errors as loaded to not block
        images[index] = img;
      });

      return () => {
        // Cleanup
        images.forEach((img) => {
          img.onload = null;
          img.onerror = null;
        });
      };
    }, [autoPlay, onLoad]);

    // Animation loop
    const animate = useCallback(
      (timestamp: number) => {
        if (!lastFrameTimeRef.current) {
          lastFrameTimeRef.current = timestamp;
        }

        const elapsed = timestamp - lastFrameTimeRef.current;

        if (elapsed >= frameDuration) {
          // Move frame in current direction
          frameRef.current += directionRef.current;

          // Handle boundaries
          if (frameRef.current >= TOTAL_FRAMES) {
            if (pingPong) {
              // Reverse direction at end
              directionRef.current = -1;
              frameRef.current = TOTAL_FRAMES - 2; // Step back one frame
            } else if (loop) {
              // Regular loop: jump back to start
              frameRef.current = 0;
            } else {
              // Stop at end
              frameRef.current = TOTAL_FRAMES - 1;
              setIsPlaying(false);
              onComplete?.();
              return;
            }
          } else if (frameRef.current < 0) {
            if (pingPong) {
              // Reset to frame 0
              frameRef.current = 0;
              setCurrentFrame(0);
              directionRef.current = 1;

              if (!loop) {
                // If not looping, stop after completing one full cycle
                setIsPlaying(false);
                onComplete?.();
                return;
              }

              // If looping with delay, pause before restarting
              if (loopDelay > 0) {
                setIsDelaying(true);
                delayTimeoutRef.current = setTimeout(() => {
                  setIsDelaying(false);
                  lastFrameTimeRef.current = 0; // Reset timing
                }, loopDelay);
                return; // Stop animation loop, will restart after delay
              }
            }
          }

          setCurrentFrame(frameRef.current);
          lastFrameTimeRef.current = timestamp - (elapsed % frameDuration);
        }

        animationIdRef.current = requestAnimationFrame(animate);
      },
      [frameDuration, loop, pingPong, loopDelay, onComplete],
    );

    // Start/stop animation
    useEffect(() => {
      if (isPlaying && isLoaded && !isDelaying) {
        animationIdRef.current = requestAnimationFrame(animate);
      }

      return () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
      };
    }, [isPlaying, isLoaded, isDelaying, animate]);

    // Cleanup delay timeout on unmount
    useEffect(() => {
      return () => {
        if (delayTimeoutRef.current) {
          clearTimeout(delayTimeoutRef.current);
        }
      };
    }, []);

    // Control methods
    const play = useCallback(() => {
      if (isLoaded) {
        setIsPlaying(true);
      }
    }, [isLoaded]);

    const pause = useCallback(() => {
      setIsPlaying(false);
    }, []);

    const reset = useCallback(() => {
      frameRef.current = 0;
      setCurrentFrame(0);
      lastFrameTimeRef.current = 0;
      directionRef.current = 1; // Reset to forward direction
      setIsDelaying(false);
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
    }, []);

    const restart = useCallback(() => {
      reset();
      play();
    }, [reset, play]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        play,
        pause,
        reset,
        restart,
        isPlaying,
        isLoaded,
      }),
      [play, pause, reset, restart, isPlaying, isLoaded],
    );

    return (
      <div className={cn('relative inline-block', className)}>
        <div style={{ width: size, height: size }}>
          {!isLoaded && (
            <div className='aucctus-bg-secondary absolute inset-0 flex flex-col items-center justify-center rounded-lg'>
              <div className='aucctus-text-sm aucctus-text-secondary mb-2'>
                Loading animation...
              </div>
              <div className='aucctus-bg-tertiary h-1 w-3/4 overflow-hidden rounded-full'>
                <div
                  className='aucctus-bg-brand-solid h-full transition-all duration-150'
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <div className='aucctus-text-xs aucctus-text-tertiary mt-1'>
                {loadProgress}%
              </div>
            </div>
          )}

          {isLoaded && imagesRef.current[currentFrame] && (
            <img
              src={imagesRef.current[currentFrame].src}
              alt='Aucctus Logo Animation'
              className='h-full w-full object-contain'
              style={{ imageRendering: 'auto' }}
            />
          )}
        </div>

        {showControls && isLoaded && (
          <div className='mt-3 flex items-center justify-center gap-2'>
            <button
              onClick={isPlaying ? pause : play}
              className='btn btn-sm btn-secondary'
              type='button'
            >
              {isPlaying ? (
                <svg
                  className='h-4 w-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              ) : (
                <svg
                  className='h-4 w-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
            </button>
            <button
              onClick={restart}
              className='btn btn-sm btn-secondary'
              type='button'
            >
              <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
            <span className='aucctus-text-xs aucctus-text-tertiary ml-2'>
              {currentFrame + 1}/{TOTAL_FRAMES}
            </span>
          </div>
        )}
      </div>
    );
  },
);

LogoAnimation.displayName = 'LogoAnimation';

export default LogoAnimation;
