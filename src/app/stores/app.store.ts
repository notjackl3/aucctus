import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IAccount, IUser } from '../../libs/api/types';

interface AppStoreState {
  user: IUser | undefined;
  account: IAccount | undefined;
  initialized: boolean;
  serverError: boolean;
  setUser: (user: IUser) => void;
  setAccount: (account: IAccount) => void;

  initializeApp: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      user: undefined,
      account: undefined,
      initialized: false,
      serverError: true,
      setUser: (user) => {
        console.log('setUser', user);
        set({ user });
      },
      setAccount: (account) => set({ account }),

      initializeApp: async () => {
        set({ initialized: true });
      },
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, initialized: state.initialized }),
    },
  ),
);
