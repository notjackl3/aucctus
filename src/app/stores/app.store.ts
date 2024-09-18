import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IAccount, IUser } from '../../libs/api/types';

interface AppStoreState {
  user: IUser | undefined | null;
  account: IAccount | undefined | null;
  initialized: boolean;
  serverError: boolean;
  setUser: (user: IUser | undefined | null) => void;
  setAccount: (account: IAccount | undefined | null) => void;

  initializeApp: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      user: undefined,
      account: undefined,
      initialized: false,
      serverError: true,
      setUser: (user) => {
        set({ user });
      },
      setAccount: (account) => set({ account }),

      initializeApp: () => {
        set({ initialized: true });
      },
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        initialized: state.initialized,
      }),
    },
  ),
);
