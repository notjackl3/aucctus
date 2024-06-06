import { create } from 'zustand';
import CryptoJS from 'crypto-js';
import api from '../../libs/api';

const secretKey = import.meta.env.VITE_SECRET_KEY;

enum StorageKeys {
  acc = 'afc',
  ref = 'rfg',
}

/**
 * Interface for token parts.
 * Includes a, b, c as token parts and e as a decoy value.
 */
interface IParts {
  a: string;
  b: string;
  c: string;
  e: string;
}

/**
 * Splits the token into three parts and adds a decoy value.
 * @param token - The token to be split.
 * @returns An object containing the token parts and a decoy value.
 */
const splitIntoThree = (token: string): IParts => {
  const part1 = token.substring(0, Math.ceil(token.length / 3));
  const part2 = token.substring(Math.ceil(token.length / 3), Math.ceil((2 * token.length) / 3));
  const part3 = token.substring(Math.ceil((2 * token.length) / 3));
  const decoy = part1.split('').reverse().join(''); // A simple decoy, you can change this to something else
  return { a: part1, b: part2, c: part3, e: decoy };
};

/**
 * Merges the token parts back into a single token.
 * @param parts - An object containing the token parts.
 * @returns The merged token.
 */
const mergeFromThree = ({ a, b, c }: IParts): string => {
  return a + b + c;
};

/**
 * Zustand store for managing encrypted tokens.
 */
interface TokenStore {
  access: string | undefined;
  refresh: string | undefined;
  hasRetrievedTokens: boolean;
  setTokens: (access: string | undefined, refresh: string | undefined) => void;
  clearTokens: () => void;
  storeTokens: (access: string | undefined, refresh: string | undefined) => void;
  retrieveTokens: () => void;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  access: undefined,
  refresh: undefined,
  hasRetrievedTokens: false,

  /**
   * Sets the access and refresh tokens and updates the API access token.
   * @param access - The access token to be set.
   * @param refresh - The refresh token to be set.
   */
  setTokens: (access, refresh) => {
    set({ access, refresh });
    if (access !== api.accessToken) {
      api.accessToken = access;
    }
  },

  /**
   * Clears the tokens from local storage and resets the state.
   */
  clearTokens: () => {
    console.log('Clearing tokens');
    localStorage.removeItem(StorageKeys.acc);
    localStorage.removeItem(StorageKeys.ref);
    set({ access: undefined, refresh: undefined });
  },

  /**
   * Stores the access and refresh tokens in local storage after encrypting and splitting them into parts.
   * @param access - The access token to be stored.
   * @param refresh - The refresh token to be stored.
   */
  storeTokens: (access, refresh) => {
    if (!access || !refresh) {
      get().clearTokens();
      return;
    }
    try {
      const encryptedAccess = CryptoJS.AES.encrypt(access, secretKey).toString();
      const encryptedRefresh = CryptoJS.AES.encrypt(refresh, secretKey).toString();

      const accessParts = splitIntoThree(encryptedAccess);
      const refreshParts = splitIntoThree(encryptedRefresh);

      sessionStorage.setItem(StorageKeys.acc, JSON.stringify(accessParts));
      localStorage.setItem(StorageKeys.ref, JSON.stringify(refreshParts));

      get().setTokens(access, refresh);
      set({ hasRetrievedTokens: true });
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  },

  /**
   * Retrieves the access and refresh tokens from local storage, decrypts them, and updates the state.
   */
  retrieveTokens: () => {
    try {
      const accessPartsString = sessionStorage.getItem(StorageKeys.acc);
      const refreshPartsString = localStorage.getItem(StorageKeys.ref);

      if (accessPartsString && refreshPartsString) {
        const accessParts: IParts = JSON.parse(accessPartsString);
        const refreshParts: IParts = JSON.parse(refreshPartsString);

        const encryptedAccess = mergeFromThree(accessParts);
        const encryptedRefresh = mergeFromThree(refreshParts);

        const decryptedAccess = CryptoJS.AES.decrypt(encryptedAccess, secretKey).toString(CryptoJS.enc.Utf8);
        const decryptedRefresh = CryptoJS.AES.decrypt(encryptedRefresh, secretKey).toString(CryptoJS.enc.Utf8);

        get().setTokens(decryptedAccess, decryptedRefresh);
      }
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      get().clearTokens();
    }
    set({ hasRetrievedTokens: true });
  },
}));
