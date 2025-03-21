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

const authSlice: Lens<IAuthState, IAppStore> = (set, get, storeApi) => {
  const actionContext = { set, get, storeApi };

  return {
    access: undefined,
    refresh: undefined,
    user: undefined,
    account: undefined,
    initialized: false,
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
