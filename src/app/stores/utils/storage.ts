import CryptoJS from 'crypto-js';

/**
 * Secret key used for encrypting/decrypting sensitive data
 * Loaded from environment variables for security
 */
const secretKey = import.meta.env.VITE_SECRET_KEY;

/**
 * Configuration interface for AucctusStorage
 */
export interface AucctusStorageConfig {
  /** Paths to store in localStorage */
  storage?: 'localStorage' | 'sessionStorage';
  encrypt: string[];
}

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
  async getItem(name: string): Promise<string | null> {
    const storage = this.adapters[this.config.storage || 'localStorage'];
    // Retrieve the main state from default storage (localStorage).
    const mainValue = storage.getItem(name);
    let state: Record<string, any> = {};
    if (mainValue) {
      try {
        const data = JSON.parse(mainValue);
        state = data.state || {};
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error parsing main storage value', e);
      }
    }

    if (this.config.encrypt && this.config.encrypt.length > 0) {
      const encyptedSlices = this.config.encrypt || [];
      for (const path of encyptedSlices) {
        state[path] = this._decrypt(state[path]);
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
    const storage = this.adapters[this.config.storage || 'localStorage'];
    try {
      const data = JSON.parse(newValue);
      const state = data.state || {};
      // For each configured storage, extract and store the corresponding paths.
      // Save the remaining state in the default storage (localStorage).

      if (this.config.encrypt && this.config.encrypt.length > 0) {
        const encryptedPaths = this.config.encrypt || [];
        for (const path of encryptedPaths) {
          state[path] = this._encrypt(state[path]);
        }
      }

      storage.setItem(name, JSON.stringify({ state }));
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
    const storage = this.adapters[this.config.storage || 'localStorage'];
    storage.removeItem(name);
  }

  // Default encryption functions using AES.
  // You can override these in the configuration.
  _encrypt(data: any, key: string = secretKey): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  }
  _decrypt(encrypted: string, key: string = secretKey): any {
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}
