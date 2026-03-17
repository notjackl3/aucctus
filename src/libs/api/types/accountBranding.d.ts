// Account Branding Type Definitions
// Based on Osiris schemas in apps/accounts/schemas/account_branding.py

// ============================================
// Response Types
// ============================================

export interface IAccountBranding {
  uuid: string;
  brandName: string;
  tagline: string;
  logoUrl: string;
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
