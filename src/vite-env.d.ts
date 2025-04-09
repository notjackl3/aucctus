/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_AUCCTUS_BASE_RESOURCE_URL: string;
  readonly VITE_AUCCTUS_BASE_WS_URL: string;
  readonly VITE_SENTRY_DNS: string;
  readonly VITE_SECRET_KEY: string;
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

declare const __APP_VERSION__: string;
declare const __ENVIRONMENT__: 'development' | 'staging' | 'production';

// Feature flags
declare const FEATURE_VERSION_HISTORY: boolean;
