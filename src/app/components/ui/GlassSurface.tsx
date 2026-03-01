import { cn } from '@libs/utils/react';
import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

type GlassVariant = 'default' | 'vibrant' | 'contextual' | 'elevated';
type ElementType =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'nav'
  | 'main'
  | 'header'
  | 'footer';

interface StyleWithCustomProps extends React.CSSProperties {
  '--persona-color'?: string;
}

interface GlassSurfaceProps extends Omit<HTMLMotionProps<'div'>, 'as'> {
  /**
   * Content to render inside the glass surface
   */
  children?: React.ReactNode;
  /**
   * Additional CSS classes to apply
   */
  className?: string;
  /**
   * The HTML element to render (default: 'div')
   */
  as?: ElementType;
  /**
   * Glass variant style:
   * - 'default': Standard glass surface for cards, panels, widgets
   * - 'vibrant': Higher contrast for hero sections, overlays
   * - 'contextual': Dynamic theming using --persona-color CSS variable
   * - 'elevated': Higher opacity for nested glass-on-glass surfaces
   */
  variant?: GlassVariant;
  /**
   * HSL color values for contextual variant (e.g., "200 70% 80%")
   * Only used when variant is 'contextual'
   */
  personaColor?: string;
}

/**
 * GlassSurface - A glass morphic container component
 *
 * Uses the Liquid Glass design system CSS variables and classes.
 * Supports three variants for different use cases:
 * - default: Standard glass surface for cards, panels, widgets
 * - vibrant: Higher contrast for hero sections, overlays
 * - contextual: Dynamic theming using persona's theme color
 *
 * @example
 * // Basic usage
 * <GlassSurface>Content</GlassSurface>
 *
 * @example
 * // Vibrant variant for hero sections
 * <GlassSurface variant="vibrant" className="p-6">
 *   Hero content
 * </GlassSurface>
 *
 * @example
 * // Contextual variant with persona theming
 * <GlassSurface variant="contextual" personaColor="200 70% 80%">
 *   Persona-themed content
 * </GlassSurface>
 *
 * @example
 * // Using as different element type
 * <GlassSurface as="section" className="p-4">
 *   Section content
 * </GlassSurface>
 */
const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  className,
  as = 'div',
  variant = 'default',
  personaColor,
  style,
  ...motionProps
}) => {
  const variantClasses: Record<GlassVariant, string> = {
    default: 'liquid-glass',
    vibrant: 'liquid-glass-vibrant',
    contextual: 'liquid-glass-persona',
    elevated: 'liquid-glass-elevated',
  };

  // Entry animation configuration
  const defaultAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' as const },
  };

  // Merge persona color into style if using contextual variant
  const mergedStyle: StyleWithCustomProps | undefined =
    variant === 'contextual' && personaColor
      ? {
          ...(style as React.CSSProperties | undefined),
          '--persona-color': personaColor,
        }
      : (style as React.CSSProperties | undefined);

  // Create the motion component for the specified element type
  const MotionComponent = motion[as];

  return (
    <MotionComponent
      className={cn(variantClasses[variant], className)}
      style={mergedStyle as React.CSSProperties}
      {...defaultAnimation}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  );
};

export default GlassSurface;
