import React from 'react';
import { cn } from '@libs/utils/react';

interface LiquidGlassDropdownProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Liquid Glass wrapper for dropdown menus.
 * Renders the shell/rim/surface triple-layer glass border
 * at a scale appropriate for dropdowns (thinner rim, smaller radius).
 */
const LiquidGlassDropdown = React.forwardRef<
  HTMLDivElement,
  LiquidGlassDropdownProps
>(({ children, className }, ref) => (
  <div ref={ref} className='liquid-glass-dropdown-shell'>
    <div className='liquid-glass-dropdown-rim' aria-hidden='true' />
    <div className={cn('liquid-glass-dropdown-surface', className)}>
      {children}
    </div>
  </div>
));

LiquidGlassDropdown.displayName = 'LiquidGlassDropdown';

export default LiquidGlassDropdown;
