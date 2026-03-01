import React from 'react';
import { cn } from '@libs/utils/react';

export interface ChromaticGlassProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Glass variant:
   * - minimal: Clean glass for nested/secondary elements
   * - chromatic: Glass with embedded brand color gradients (default)
   * - immersive: Full treatment with enhanced depth and animation support
   */
  variant?: 'minimal' | 'chromatic' | 'immersive';
  /**
   * HSL color triplet for context-aware accent (e.g., persona theme color)
   * Format: "200 70% 50%" (without 'hsl()' wrapper)
   */
  accentColor?: string;
  /**
   * Optional image URL for subtle refraction effect (immersive variant)
   * Will be heavily blurred and magnified behind the glass
   */
  imageHint?: string;
  /**
   * Intensity of chromatic effect:
   * - subtle: Very light color wash (0.03)
   * - medium: Noticeable but refined (0.06)
   * - bold: Prominent color presence (0.12)
   */
  intensity?: 'subtle' | 'medium' | 'bold';
  /** Enable slow chromatic shift animation (immersive only) */
  animate?: boolean;
  /** Custom border radius (default: rounded-xl) */
  rounded?: 'lg' | 'xl' | '2xl' | 'full';
  /** Element to render as */
  as?: keyof JSX.IntrinsicElements;
  /** Click handler */
  onClick?: () => void;
}

const intensityValues: Record<string, number> = {
  subtle: 0.03,
  medium: 0.06,
  bold: 0.12,
};

const roundedValues: Record<string, string> = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

const ChromaticGlass: React.FC<ChromaticGlassProps> = ({
  children,
  className,
  variant = 'chromatic',
  accentColor,
  imageHint,
  intensity = 'medium',
  animate = false,
  rounded = 'xl',
  as: Component = 'div',
  onClick,
}) => {
  const intensityValue = intensityValues[intensity];
  const roundedClass = roundedValues[rounded];

  const customStyles: React.CSSProperties = {
    ['--glass-chromatic-intensity' as string]: intensityValue,
    ...(accentColor && {
      ['--glass-chromatic-accent' as string]: accentColor,
    }),
  };

  if (variant === 'minimal') {
    return (
      <Component
        className={cn('liquid-glass-minimal', roundedClass, className)}
        style={customStyles}
        onClick={onClick}
      >
        {children}
      </Component>
    );
  }

  if (variant === 'immersive') {
    return (
      <Component
        className={cn(
          'liquid-glass-immersive',
          animate && 'liquid-glass-animate',
          roundedClass,
          className,
        )}
        style={customStyles}
        onClick={onClick}
      >
        {imageHint && (
          <div
            className='pointer-events-none absolute inset-0'
            style={{
              backgroundImage: `url(${imageHint})`,
              backgroundPosition: 'center',
              backgroundSize: '180%',
              filter: 'blur(30px) saturate(1.3)',
              opacity: intensityValue * 3,
              transform: 'scale(1.1)',
            }}
            aria-hidden='true'
          />
        )}

        {accentColor && (
          <div
            className='pointer-events-none absolute inset-0'
            style={{
              background: `radial-gradient(ellipse 130% 100% at 25% 20%, hsl(${accentColor} / ${intensityValue * 2}) 0%, transparent 55%)`,
            }}
            aria-hidden='true'
          />
        )}

        <div className='relative z-10'>{children}</div>
      </Component>
    );
  }

  // Default: chromatic variant
  return (
    <Component
      className={cn('liquid-glass-chromatic', roundedClass, className)}
      style={customStyles}
      onClick={onClick}
    >
      {accentColor && (
        <div
          className='pointer-events-none absolute inset-0 z-[1]'
          style={{
            background: `radial-gradient(ellipse 120% 90% at 30% 25%, hsl(${accentColor} / ${intensityValue * 1.5}) 0%, transparent 60%)`,
            borderRadius: 'inherit',
          }}
          aria-hidden='true'
        />
      )}

      {imageHint && (
        <div
          className='pointer-events-none absolute inset-0 z-[0]'
          style={{
            backgroundImage: `url(${imageHint})`,
            backgroundPosition: 'center',
            backgroundSize: '160%',
            filter: 'blur(24px) saturate(1.2)',
            opacity: intensityValue * 2.5,
            transform: 'scale(1.05)',
            borderRadius: 'inherit',
          }}
          aria-hidden='true'
        />
      )}

      <div className='relative z-10'>{children}</div>
    </Component>
  );
};

export interface ChromaticGlassSelectionProps {
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  accentColor?: string;
  imageHint?: string;
  onClick?: () => void;
}

export const ChromaticGlassSelection: React.FC<
  ChromaticGlassSelectionProps
> = ({
  children,
  className,
  isSelected = false,
  accentColor,
  imageHint,
  onClick,
}) => {
  if (!isSelected) {
    return (
      <div
        className={cn(
          'relative cursor-pointer rounded-lg p-1.5 transition-colors duration-100',
          'hover:bg-foreground/[0.03]',
          className,
        )}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'liquid-glass-contextual relative cursor-pointer overflow-hidden rounded-lg',
        className,
      )}
      onClick={onClick}
    >
      {imageHint && (
        <div
          className='absolute inset-0'
          style={{
            opacity: 0.15,
            backgroundImage: `url(${imageHint})`,
            backgroundPosition: 'center',
            backgroundSize: '200%',
            filter: 'blur(36px) saturate(1.3)',
          }}
        />
      )}

      {accentColor && (
        <div
          className='absolute inset-0 rounded-lg'
          style={{
            backgroundColor: `hsl(${accentColor} / 0.1)`,
          }}
        />
      )}

      {accentColor && (
        <div
          className='pointer-events-none absolute inset-0 rounded-lg'
          style={{
            border: `1px solid hsl(${accentColor} / 0.12)`,
          }}
        />
      )}

      <div className='relative z-10 p-1.5'>{children}</div>
    </div>
  );
};

export default ChromaticGlass;
