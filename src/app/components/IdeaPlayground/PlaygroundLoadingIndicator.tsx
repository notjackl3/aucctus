import React from 'react';
import { createPortal } from 'react-dom';
import { useTransition, animated, easings } from 'react-spring';
import NavLogo from '@assets/aucctus_logo.png';
import { cn } from '@libs/utils/react';

interface PlaygroundLoadingIndicatorProps {
  /** Whether the loading indicator should be visible */
  show: boolean;
  /** Optional message to display below the logo */
  message?: string;
  /** Optional className to override default positioning */
  className?: string;
  /** Whether to render using a portal (default: true) */
  usePortal?: boolean;
}

export const PlaygroundLoadingIndicator: React.FC<
  PlaygroundLoadingIndicatorProps
> = ({
  show,
  message,
  className = 'pointer-events-none fixed right-6 top-6 z-[9999] flex items-center gap-3',
  usePortal = true,
}) => {
  // Fade in/out transition
  const transitions = useTransition(show, {
    from: { opacity: 0, scale: 0.4, transform: 'translateY(-20px)' },
    enter: { opacity: 1, scale: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0 },
    config: { duration: 300, easing: easings.easeInOutSine },
  });

  const content = transitions(
    (style, item) =>
      item && (
        <animated.div style={style} className={cn(className)}>
          {/* Glassmorphic container */}
          <div className='aucctus-bg-frosted-glass flex items-center gap-3 rounded-2xl border border-white/20 px-4 py-3 shadow-2xl backdrop-blur-xl'>
            {/* Logo with animation */}
            <div className='relative h-10 w-10'>
              {/* Middle pulsing ring */}
              <div
                style={{ animationDelay: '300ms' }}
                className='absolute inset-1 animate-pulse-subtle rounded-lg bg-white/50 opacity-50 transition-opacity duration-300'
              />

              {/* Logo */}
              <div className='absolute inset-0 flex h-10 w-10 items-center justify-center'>
                <img
                  src={NavLogo}
                  alt='Aucctus'
                  className='h-6 w-6 animate-pulse-subtle object-contain'
                />
              </div>
            </div>

            {/* Optional message */}
            {message && (
              <span className='aucctus-text-sm aucctus-text-white flex'>
                {message.split('').map((char, index) => (
                  <span
                    key={index}
                    className='inline-block animate-float-subtle'
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
            )}
          </div>
        </animated.div>
      ),
  );

  // Use portal to render at document body level or render inline
  return usePortal ? createPortal(content, document.body) : content;
};
