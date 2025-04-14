import images from '@assets/img';
import { cn } from '@libs/utils/react';
import React, { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface AucctusMotionBackgroundProps {
  /**
   * Background image URL for the motion effect
   * @default images.aiExplorationsBackground
   */
  backgroundImage?: string;
  /**
   * Animation duration in seconds for the background movement
   * @default 40
   */
  animationDuration?: number;
  /**
   * Custom animation keyframes for the background
   */
  customAnimationStyles?: string;
  /**
   * Whether to apply the fade-in animation
   * @default true
   */
  fadeIn?: boolean;
  /**
   * Duration of the fade-in animation in seconds
   * @default 1
   */
  fadeInDuration?: number;
  /**
   * Initial opacity of the component
   * @default 0
   */
  initialOpacity?: number;
  /**
   * Children to render inside the component
   */
  children?: ReactNode;
}

type AucctusMotionDivProps = AucctusMotionBackgroundProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof AucctusMotionBackgroundProps>;

/**
 * A reusable component that provides motion background effects with customizable properties
 * Uses the AI explorations background by default
 */
const AiInteractionDiv = React.forwardRef<
  HTMLDivElement,
  AucctusMotionDivProps
>(
  (
    {
      backgroundImage = images.aiExplorationsBackground,
      animationDuration = 40,
      customAnimationStyles,
      fadeIn = true,
      fadeInDuration = 1,
      initialOpacity = 0,
      className,
      children,
      style,
      ...divProps
    },
    ref,
  ) => {
    // Default animation styles if not provided
    const defaultAnimationStyles = `
    @keyframes fadeIn {
      from { opacity: ${initialOpacity}; }
      to { opacity: 1; }
    }
    
    @keyframes moveBackground {
      0% { background-position: 0% 0%; }
      50% { background-position: 60% 100%; }
      100% { background-position: 0% 0%; }
    }
  `;

    const animationStyles = customAnimationStyles || defaultAnimationStyles;

    const motionStyle: CSSProperties = {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      animation: fadeIn
        ? `fadeIn ${fadeInDuration}s ease-in-out forwards, moveBackground ${animationDuration}s ease infinite`
        : `moveBackground ${animationDuration}s ease infinite`,
      opacity: fadeIn ? initialOpacity : 1,
      ...style,
    };

    return (
      <>
        <style>{animationStyles}</style>
        <div
          ref={ref}
          className={cn('flex flex-col', className)}
          style={motionStyle}
          {...divProps}
        >
          {children}
        </div>
      </>
    );
  },
);

// Add display name for better debugging
AiInteractionDiv.displayName = 'AiInteractionDiv';

export default AiInteractionDiv;
