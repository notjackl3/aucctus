// Account Branding Type Definitions
// Based on Osiris schemas in apps/accounts/schemas/account_branding.py

// ============================================
// Logo Variant Types
// ============================================

export type LogoVariantName = 'color' | 'light' | 'dark';

export interface ILogoVariant {
  url: string;
  dominantHex?: string | null;
  luminance?: number | null;
}

export interface IAccountLogos {
  color?: ILogoVariant | null;
  light?: ILogoVariant | null;
  dark?: ILogoVariant | null;
}

// ============================================
// Response Types
// ============================================

export interface IAccountBranding {
  uuid: string;
  brandName: string;
  tagline: string;
  /** @deprecated Use `logos.color.url` instead. Kept populated by the backend as an alias for `logos.color.url`. */
  logoUrl: string;
  logos: IAccountLogos;
  hqImageUrl: string;
  colors: string[];
  typography: Record<string, string>;
  toneOfVoice: string;
  source: string;
  isActive: boolean;
}

// ============================================
// Update Payloads
// ============================================

export interface IUpdateAccountBrandingPayload {
  brandName?: string;
  tagline?: string;
  colors?: string[];
  typography?: Record<string, string>;
  toneOfVoice?: string;
}
