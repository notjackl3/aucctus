import { Lens, lens } from '@dhmk/zustand-lens';
import { IAccount, IUser } from '@libs/api/types';
import type { IAppStore } from '../store';
import {
  clearTokens,
  IAuthActions,
  isAuthenticated,
  logout,
  setAccount,
  setInitialized,
  setUser,
  storeTokens,
} from './actions';

export interface IAuthState extends IAuthActions {
  access?: string;
  refresh?: string;
  initialized: boolean;

  user: IUser | undefined | null;
  account: IAccount | undefined | null;
}

// Export initial state for use in store and reset functionality
export const initialAuthState = {
  access: undefined as string | undefined,
  refresh: undefined as string | undefined,
  user: undefined as IUser | undefined | null,
  account: undefined as IAccount | undefined | null,
  initialized: false,
};

const authSlice: Lens<IAuthState, IAppStore> = (set, get, storeApi) => {
  const actionContext = { set, get, storeApi };

  return {
    ...initialAuthState,
    clearTokens: clearTokens.bind(actionContext),
    setInitialized: setInitialized.bind(actionContext),
    isAuthenticated: isAuthenticated.bind(actionContext),
    setUser: setUser.bind(actionContext),
    setAccount: setAccount.bind(actionContext),
    logout: logout.bind(actionContext),
    storeTokens: storeTokens.bind(actionContext),
  };
};

export default lens<IAuthState, IAppStore>(authSlice);
