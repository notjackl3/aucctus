import CryptoJS from 'crypto-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '../../libs/api';
import { IAccount, IUser } from '../../libs/api/types';

const secretKey = import.meta.env.VITE_SECRET_KEY;

// Custom secure storage that handles encryption and decryption.
const secureStorage = {
  getItem: (name: string): string | null => {
    const value = localStorage.getItem(name);
    if (!value) return null;
    try {
      const data = JSON.parse(value);
      const { access, refresh, user, account, initialized } = data.state;
      const decryptedAccess = access
        ? CryptoJS.AES.decrypt(access, secretKey).toString(CryptoJS.enc.Utf8)
        : undefined;
      const decryptedRefresh = refresh
        ? CryptoJS.AES.decrypt(refresh, secretKey).toString(CryptoJS.enc.Utf8)
        : undefined;
      const decryptedUser = !!user
        ? JSON.parse(
            CryptoJS.AES.decrypt(user, secretKey).toString(CryptoJS.enc.Utf8),
          )
        : undefined;
      const decryptedAccount = !!account
        ? JSON.parse(
            CryptoJS.AES.decrypt(account, secretKey).toString(
              CryptoJS.enc.Utf8,
            ),
          )
        : undefined;
      return JSON.stringify({
        state: {
          access: decryptedAccess,
          refresh: decryptedRefresh,
          user: decryptedUser,
          account: decryptedAccount,
          initialized,
        },
      });
    } catch (error) {
      console.error('Error in secureStorage.getItem', error);
      return null;
    }
  },
  setItem: (name: string, newValue: string) => {
    try {
      const data = JSON.parse(newValue);
      const { access, refresh, user, account, initialized } = data.state;
      const encryptedAccess = access
        ? CryptoJS.AES.encrypt(access, secretKey).toString()
        : undefined;
      const encryptedRefresh = refresh
        ? CryptoJS.AES.encrypt(refresh, secretKey).toString()
        : undefined;
      const encryptedUser = user
        ? CryptoJS.AES.encrypt(JSON.stringify(user), secretKey).toString()
        : undefined;
      const encryptedAccount = account
        ? CryptoJS.AES.encrypt(JSON.stringify(account), secretKey).toString()
        : undefined;
      const persistState = {
        state: {
          access: encryptedAccess,
          refresh: encryptedRefresh,
          user: encryptedUser,
          account: encryptedAccount,
          initialized,
        },
      };
      localStorage.setItem(name, JSON.stringify(persistState));
    } catch (error) {
      console.error('Error in secureStorage.setItem', error);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

interface AuthStore {
  // Tokens
  access: string | undefined;
  refresh: string | undefined;
  initialized: boolean;

  // User and account info
  user: IUser | undefined | null;
  account: IAccount | undefined | null;

  // Methods for tokens
  clearTokens: () => void;
  storeTokens: (
    access: string | undefined,
    refresh: string | undefined,
  ) => Promise<void>;
  setInitialized: (value: boolean) => void;
  isAuthenticated: () => boolean;

  // Methods for user and account
  setUser: (user: IUser | undefined | null) => void;
  setAccount: (account: IAccount | undefined | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      access: undefined,
      refresh: undefined,
      user: undefined,
      account: undefined,
      initialized: false,

      // Token methods
      clearTokens: () => {
        set({ access: undefined, refresh: undefined });
      },
      logout: () => {
        set({
          user: undefined,
          account: undefined,
          access: undefined,
          refresh: undefined,
          initialized: false,
        });
      },
      storeTokens: async (access, refresh) => {
        if (!access || !refresh) {
          get().clearTokens();
          return;
        }
        set({ access, refresh });
        if (access !== api.accessToken) {
          await api.setAccessToken(access);
        }
      },

      // User and account methods
      setUser: (user) => set({ user }),
      setAccount: (account) => set({ account }),
      setInitialized: (value: boolean) => set({ initialized: value }),
      isAuthenticated: () => !!get().access && !!get().initialized,
    }),
    {
      name: 'abc-store',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        access: state.access,
        refresh: state.refresh,
        user: state.user,
        account: state.account,
        initialized: state.initialized,
      }),
    },
  ),
);
