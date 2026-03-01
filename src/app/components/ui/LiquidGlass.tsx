import React from 'react';
import { cn } from '@libs/utils/react';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'prominent';
}

const variantStyles = {
  default: {
    overlay: 'bg-gradient-to-br from-white/20 via-white/10 to-slate-100/15',
    specular:
      'shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.4),inset_0_0_4px_rgba(255,255,255,0.15)]',
    outer: 'shadow-[0_2px_8px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)]',
  },
  subtle: {
    overlay: 'bg-gradient-to-br from-white/15 via-white/8 to-slate-50/10',
    specular:
      'shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.25),inset_0_0_2px_rgba(255,255,255,0.1)]',
    outer: 'shadow-[0_1px_4px_rgba(0,0,0,0.02),0_0.5px_2px_rgba(0,0,0,0.015)]',
  },
  prominent: {
    overlay: 'bg-gradient-to-br from-white/25 via-white/15 to-slate-100/20',
    specular:
      'shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.5),inset_0_0_6px_rgba(255,255,255,0.2)]',
    outer: 'shadow-[0_4px_12px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.025)]',
  },
};

/**
 * Apple-style Liquid Glass component
 *
 * Uses multi-layered approach:
 * - SVG displacement filter for organic distortion
 * - Semi-transparent overlay
 * - Specular highlights (inset shadows)
 * - Content layer on top
 */
const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className,
  variant = 'default',
}) => {
  const styles = variantStyles[variant];

  return (
    <>
      {/* SVG Filter Definition - only needs to be in DOM once */}
      <svg className='absolute h-0 w-0' aria-hidden='true'>
        <defs>
          <filter
            id='liquid-glass-distortion'
            x='0%'
            y='0%'
            width='100%'
            height='100%'
          >
            <feTurbulence
              type='fractalNoise'
              baseFrequency='0.015 0.015'
              numOctaves={2}
              seed={42}
              result='noise'
            />
            <feGaussianBlur in='noise' stdDeviation={1.5} result='blurred' />
            <feDisplacementMap
              in='SourceGraphic'
              in2='blurred'
              scale={8}
              xChannelSelector='R'
              yChannelSelector='G'
            />
          </filter>
        </defs>
      </svg>

      <div
        className={cn(
          'relative overflow-hidden rounded-xl',
          styles.outer,
          className,
        )}
      >
        {/* Distortion filter layer */}
        <div
          className='absolute inset-0 z-0 backdrop-blur-sm'
          style={{ filter: 'url(#liquid-glass-distortion)' }}
        />

        {/* Background overlay */}
        <div
          className={cn(
            'absolute inset-0 z-[1] backdrop-blur-xl',
            styles.overlay,
          )}
        />

        {/* Specular highlights layer */}
        <div
          className={cn(
            'absolute inset-0 z-[2] rounded-xl border border-white/20',
            styles.specular,
          )}
        />

        {/* Content */}
        <div className='relative z-[3]'>{children}</div>
      </div>
    </>
  );
};

export default LiquidGlass;
