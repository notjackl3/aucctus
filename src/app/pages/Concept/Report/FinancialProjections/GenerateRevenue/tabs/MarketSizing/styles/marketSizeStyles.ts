export type MarketSizeType = 'tam' | 'sam' | 'som';

// Base styles that can be used across all components
export interface MarketSizeBaseStyles {
  // Colors
  bgClass: string;
  textColor: string;
  subtextColor: string;
  iconColor: string;
  accentColor: string;
  borderClass: string;

  // Interactive states
  hoverShadowClass: string;
  activeBorderClass: string;

  // Typography
  fontSize: string;

  // Utility classes
  filterBgClass: string;
  badgeClass: string;
}

// Additional styles specific to market size squares
export interface MarketSizeSquareStyles extends MarketSizeBaseStyles {
  className: string;
  activeClassName: string;
  position: {
    size: string;
    placement: string;
  };
}

// Market size base styles that any component can use
export const marketSizeStyles: Record<MarketSizeType, MarketSizeBaseStyles> = {
  tam: {
    bgClass: 'aucctus-bg-secondary',
    textColor: 'aucctus-text-primary',
    subtextColor: 'aucctus-text-primary',
    iconColor: 'aucctus-stroke-tertiary',
    accentColor: 'aucctus-bg-secondary',
    borderClass: 'aucctus-border-primary',
    hoverShadowClass: 'hover:shadow-blue-100',
    activeBorderClass: 'border-2 aucctus-border-primary',
    fontSize: 'aucctus-header-sm',
    filterBgClass: 'aucctus-bg-quaternary-alt',
    badgeClass: 'aucctus-text-primary',
  },
  sam: {
    bgClass: 'aucctus-bg-quaternary',
    textColor: 'aucctus-text-primary',
    subtextColor: 'aucctus-text-secondary',
    iconColor: 'aucctus-stroke-tertiary',
    accentColor: 'aucctus-bg-quaternary',
    borderClass: 'aucctus-border-primary',
    hoverShadowClass: 'hover:shadow-green-100',
    activeBorderClass: 'border-t-2 border-l-2 aucctus-border-primary',
    fontSize: 'aucctus-header-sm',
    filterBgClass: 'aucctus-bg-quaternary-alt',
    badgeClass: 'aucctus-text-primary',
  },
  som: {
    bgClass: 'aucctus-bg-brand-solid',
    textColor: 'aucctus-text-light',
    subtextColor: 'aucctus-text-light-alt',
    iconColor: 'aucctus-stroke-brand-tertiary',
    accentColor: 'aucctus-bg-brand-solid',
    borderClass: 'aucctus-border-brand',
    hoverShadowClass: 'hover:shadow-purple-100',
    activeBorderClass: 'border-2 border-white',
    fontSize: 'aucctus-header-xs',
    filterBgClass: 'aucctus-bg-quinary-alt',
    badgeClass: 'aucctus-text-light',
  },
};

// Market size square specific styles - extends the base styles with positioning
export const marketSizeSquareConfig: Record<
  MarketSizeType,
  MarketSizeSquareStyles
> = {
  tam: {
    ...marketSizeStyles.tam,
    className:
      'absolute inset-0 cursor-pointer transition-all duration-200 rounded-lg',
    activeClassName: 'border-2 aucctus-border-primary',
    position: {
      size: 'w-full h-full',
      placement: 'inset-0',
    },
  },
  sam: {
    ...marketSizeStyles.sam,
    className:
      'absolute right-0 bottom-0 w-[70%] h-[70%] cursor-pointer transition-all duration-200 rounded-tl-lg',
    activeClassName: 'border-t-2 border-l-2 aucctus-border-primary',
    position: {
      size: 'w-[70%] h-[70%]',
      placement: 'right-0 bottom-0',
    },
  },
  som: {
    ...marketSizeStyles.som,
    className:
      'absolute right-0 bottom-0 w-[40%] h-[40%] cursor-pointer transition-all duration-200 rounded-tl-lg',
    activeClassName: 'border-2 border-white',
    position: {
      size: 'w-[40%] h-[40%]',
      placement: 'right-0 bottom-0',
    },
  },
};
