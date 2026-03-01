/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
  readonly VITE_AUCCTUS_BASE_RESOURCE_URL: string;
  readonly VITE_AUCCTUS_BASE_WS_URL: string;
  readonly VITE_SENTRY_DNS: string;
  readonly VITE_SECRET_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_STS_URL: string;
  readonly VITE_AUTH_CLIENT_ID: string;
  readonly VITE_AUTH_REDIRECT_URL: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_HOTJAR_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}

declare const __APP_VERSION__: string;
declare const __ENVIRONMENT__: 'development' | 'staging' | 'production';

// Feature flags
declare const FEATURE_CUSTOMER_PROFILE_CHAT: boolean;
declare const FEATURE_CUSTOMER_PROFILE_REAL_WORLD_SIGNALS: boolean;
declare const FEATURE_CONCEPT_VERSIONING: boolean;
declare const FEATURE_WATCHTOWER: boolean;

// Hotjar User Identification
interface HotjarUserAttributes {
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  accountId?: string;
  [key: string]: string | number | boolean | undefined;
}

interface Window {
  hj?: (
    method: 'identify',
    userId: string | null,
    attributes?: HotjarUserAttributes,
  ) => void;
}
