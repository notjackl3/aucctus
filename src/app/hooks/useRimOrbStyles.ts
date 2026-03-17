import { useMemo } from 'react';
import type React from 'react';

import { useAccountBranding } from '@hooks/query/accountBranding.hook';
import { hexToHslValues } from '@libs/utils/color';

/**
 * Returns CSS custom properties for the animated glass rim orbs,
 * populated from account branding colors when available.
 * Falls back to the SCSS defaults (dark rose + deep red) when no branding exists.
 *
 * Apply the returned style to the rim element that contains `.rim-orb-1` / `.rim-orb-2`.
 */
export const useRimOrbStyles = (): React.CSSProperties | undefined => {
  const { branding } = useAccountBranding();

  return useMemo(() => {
    const colors = branding?.colors;
    if (!colors || colors.length === 0) return undefined;
    return {
      '--rim-orb-hsl-1': hexToHslValues(colors[0 % colors.length]),
      '--rim-orb-hsl-2': hexToHslValues(colors[1 % colors.length]),
    } as React.CSSProperties;
  }, [branding?.colors]);
};
