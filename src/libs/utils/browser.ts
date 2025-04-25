/**
 * Browser detection utilities
 */

/**
 * Browser types supported by detection
 */
export type BrowserType =
  | 'Chrome'
  | 'Firefox'
  | 'Safari'
  | 'Edge'
  | 'IE'
  | 'Opera'
  | 'Samsung'
  | 'UCBrowser'
  | 'Unknown';

/**
 * Interface for browser information
 */
export interface BrowserInfo {
  name: BrowserType;
  version: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Detects the current browser
 * @returns Browser information including name, version and device type
 */
export const detectBrowser = (): BrowserInfo => {
  // Default to Unknown when not in browser environment
  if (typeof window === 'undefined' || !window.navigator) {
    return {
      name: 'Unknown',
      version: '0',
      isMobile: false,
      isTablet: false,
      isDesktop: false,
    };
  }

  const userAgent = window.navigator.userAgent;
  const vendor = window.navigator.vendor;

  // Device type detection
  const isMobile =
    /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  // Browser detection logic
  let name: BrowserType = 'Unknown';
  let version = '0';

  // Edge
  if (userAgent.indexOf('Edg') > -1) {
    name = 'Edge';
    version = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || '0';
  }
  // Chrome
  else if (userAgent.indexOf('Chrome') > -1 && vendor.indexOf('Google') > -1) {
    name = 'Chrome';
    version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || '0';
  }
  // Firefox
  else if (userAgent.indexOf('Firefox') > -1) {
    name = 'Firefox';
    version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || '0';
  }
  // Safari
  else if (userAgent.indexOf('Safari') > -1 && vendor.indexOf('Apple') > -1) {
    name = 'Safari';
    version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || '0';
  }
  // Opera
  else if (userAgent.indexOf('OPR') > -1 || userAgent.indexOf('Opera') > -1) {
    name = 'Opera';
    version = userAgent.match(/(?:OPR|Opera)\/([0-9.]+)/)?.[1] || '0';
  }
  // Samsung Internet
  else if (userAgent.indexOf('SamsungBrowser') > -1) {
    name = 'Samsung';
    version = userAgent.match(/SamsungBrowser\/([0-9.]+)/)?.[1] || '0';
  }
  // UC Browser
  else if (userAgent.indexOf('UCBrowser') > -1) {
    name = 'UCBrowser';
    version = userAgent.match(/UCBrowser\/([0-9.]+)/)?.[1] || '0';
  }
  // IE
  else if (userAgent.indexOf('Trident') > -1) {
    name = 'IE';
    version = userAgent.match(/rv:([0-9.]+)/)?.[1] || '0';
  }

  return {
    name,
    version,
    isMobile,
    isTablet,
    isDesktop,
  };
};

/**
 * Checks if the current browser is the specified type
 * @param browserType The browser type to check against
 * @returns True if current browser matches the specified type
 */
export const isBrowser = (browserType: BrowserType): boolean => {
  return detectBrowser().name === browserType;
};

/**
 * Checks if the current device is mobile
 * @returns True if current device is mobile
 */
export const isMobileDevice = (): boolean => {
  return detectBrowser().isMobile;
};

/**
 * Checks if the current device is a tablet
 * @returns True if current device is a tablet
 */
export const isTabletDevice = (): boolean => {
  return detectBrowser().isTablet;
};

/**
 * Checks if the current device is desktop
 * @returns True if current device is desktop
 */
export const isDesktopDevice = (): boolean => {
  return detectBrowser().isDesktop;
};
