import CryptoJS from 'crypto-js';

/**
 * Secret key used for encrypting/decrypting sensitive data
 * Loaded from environment variables for security
 */
const secretKey = import.meta.env.VITE_SECRET_KEY;

/**
 * Encrypts sensitive authentication data using AES encryption
 * @param authState - The authentication state object containing tokens and user data
 * @returns Encrypted version of the auth state
 */
function encryptAuth(authState: any) {
  const { access, refresh, user, account, initialized } = authState;
  return {
    access: access
      ? CryptoJS.AES.encrypt(access, secretKey).toString()
      : undefined,
    refresh: refresh
      ? CryptoJS.AES.encrypt(refresh, secretKey).toString()
      : undefined,
    user: user
      ? CryptoJS.AES.encrypt(JSON.stringify(user), secretKey).toString()
      : undefined,
    account: account
      ? CryptoJS.AES.encrypt(JSON.stringify(account), secretKey).toString()
      : undefined,
    initialized, // Not encrypted as it's not sensitive
  };
}

/**
 * Decrypts encrypted authentication data
 * @param encryptedAuth - The encrypted authentication state
 * @returns Decrypted version of the auth state
 */
function decryptAuth(encryptedAuth: any) {
  const { access, refresh, user, account, initialized } = encryptedAuth;
  return {
    access: access
      ? CryptoJS.AES.decrypt(access, secretKey).toString(CryptoJS.enc.Utf8)
      : undefined,
    refresh: refresh
      ? CryptoJS.AES.decrypt(refresh, secretKey).toString(CryptoJS.enc.Utf8)
      : undefined,
    user: user
      ? JSON.parse(
          CryptoJS.AES.decrypt(user, secretKey).toString(CryptoJS.enc.Utf8),
        )
      : undefined,
    account: account
      ? JSON.parse(
          CryptoJS.AES.decrypt(account, secretKey).toString(CryptoJS.enc.Utf8),
        )
      : undefined,
    initialized,
  };
}

/**
 * Extracts a nested value from an object using dot notation and removes it from the original object
 * Example: extractValue({ user: { settings: { theme: 'dark' } } }, 'user.settings.theme') returns 'dark'
 * @param obj - Source object to extract from
 * @param path - Dot-notation path to the desired value
 * @returns The extracted value or undefined if not found
 */
function extractValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[parts[i]];
  }
  const lastPart = parts[parts.length - 1];
  const value = current ? current[lastPart] : undefined;
  if (current && value !== undefined) {
    delete current[lastPart];
  }
  return value;
}

/**
 * Sets a nested value in an object using dot notation, creating intermediate objects as needed
 * Example: setValue({}, 'user.settings.theme', 'dark') creates { user: { settings: { theme: 'dark' } } }
 * @param obj - Target object to set value in
 * @param path - Dot-notation path where to set the value
 * @param value - Value to set
 */
function setValue(obj: any, path: string, value: any) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * Determines if a given path should be ignored based on ignore patterns
 * @param path - Path to check
 * @param ignorePatterns - Array of string or RegExp patterns to match against
 * @returns True if path should be ignored, false otherwise
 */
function shouldIgnore(
  path: string,
  ignorePatterns?: (string | RegExp)[],
): boolean {
  if (!ignorePatterns) return false;
  for (const pattern of ignorePatterns) {
    if (typeof pattern === 'string' && path.includes(pattern)) {
      return true;
    }
    if (pattern instanceof RegExp && pattern.test(path)) {
      return true;
    }
  }
  return false;
}

/**
 * Configuration interface for AucctusStorage
 */
export interface AucctusStorageConfig {
  /** Paths to store in localStorage */
  localStorage?: string[];
  /** Paths to store in sessionStorage */
  sessionStorage?: string[];
  options?: {
    /** Patterns for paths to ignore during storage operations */
    ignorePatterns?: (string | RegExp)[];
  };
}

/**
 * Custom storage implementation that supports:
 * - Storing different parts of state in different storage types (localStorage/sessionStorage)
 * - Automatic encryption of sensitive data
 * - Selective persistence through ignore patterns
 *
 * Usage:
 * ```typescript
 * const storage = new AucctusStorage({
 *   localStorage: ['auth'],
 *   sessionStorage: ['global'],
 *   options: {
 *     ignorePatterns: ['sensitive']
 *   }
 * });
 * ```
 */
export class AucctusStorage {
  private config: AucctusStorageConfig;
  // Map of underlying storage adapters.
  private adapters: { [key: string]: Storage } = {
    localStorage,
    sessionStorage,
  };

  constructor(config: AucctusStorageConfig) {
    this.config = config;
  }

  /**
   * Retrieves and reconstructs state from various storage locations
   * @param name - Base key for storage
   * @returns JSON string of merged state from all storage locations
   */
  getItem(name: string): string | null {
    // Retrieve the main state from default storage (localStorage).
    const mainValue = localStorage.getItem(name);
    let state: any = {};
    if (mainValue) {
      try {
        const data = JSON.parse(mainValue);
        state = data.state || {};
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error parsing main storage value', e);
      }
    }
    // For each configured storage (e.g. sessionStorage), retrieve and merge the saved paths.
    for (const storageKey of Object.keys(this.config)) {
      if (storageKey === 'options') continue;
      const paths = (this.config as any)[storageKey] as string[];
      const adapter = this.adapters[storageKey];
      if (!adapter) continue;
      for (const path of paths) {
        if (shouldIgnore(path, this.config.options?.ignorePatterns)) continue;
        const compositeKey = `${name}:${path}`;
        const storedValue = adapter.getItem(compositeKey);
        if (storedValue) {
          try {
            let value = JSON.parse(storedValue);
            // If this path is "auth", decrypt it.
            if (path === 'auth') {
              value = decryptAuth(value);
            }
            setValue(state, path, value);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error parsing value for', compositeKey, e);
          }
        }
      }
    }
    return JSON.stringify({ state });
  }

  /**
   * Stores state across different storage locations based on configuration
   * @param name - Base key for storage
   * @param newValue - JSON string of state to store
   */
  setItem(name: string, newValue: string): void {
    try {
      const data = JSON.parse(newValue);
      const state = data.state || {};
      // For each configured storage, extract and store the corresponding paths.
      for (const storageKey of Object.keys(this.config)) {
        if (storageKey === 'options') continue;
        const paths = (this.config as any)[storageKey] as string[];
        const adapter = this.adapters[storageKey];
        if (!adapter) continue;
        for (const path of paths) {
          if (shouldIgnore(path, this.config.options?.ignorePatterns)) continue;
          let extracted = extractValue(state, path);
          if (extracted !== undefined) {
            // For the "auth" slice, encrypt before saving.
            if (path === 'auth') {
              extracted = encryptAuth(extracted);
            }
            const compositeKey = `${name}:${path}`;
            adapter.setItem(compositeKey, JSON.stringify(extracted));
          }
        }
      }
      // Save the remaining state in the default storage (localStorage).
      localStorage.setItem(name, JSON.stringify({ state }));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error in AucctusStorage.setItem', e);
    }
  }

  /**
   * Removes state from all configured storage locations
   * @param name - Base key for storage
   */
  removeItem(name: string): void {
    localStorage.removeItem(name);
    for (const storageKey of Object.keys(this.config)) {
      if (storageKey === 'options') continue;
      const paths = (this.config as any)[storageKey] as string[];
      const adapter = this.adapters[storageKey];
      if (!adapter) continue;
      for (const path of paths) {
        const compositeKey = `${name}:${path}`;
        adapter.removeItem(compositeKey);
      }
    }
  }
}
