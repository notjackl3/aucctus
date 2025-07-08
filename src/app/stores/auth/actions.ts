import api from '@libs/api';
import { IAccount, IUser } from '@libs/api/types';
import { produce } from 'immer';
import type { IStoreApi } from '../store';
import { IAuthState } from './store';
import { isTokenExpired } from '../../../libs/utils/jwt';
import analytics from '../../../libs/telemetry';

export interface IAuthActions {
  setInitialized: (value: boolean) => void;
  isAuthenticated: () => boolean;

  setUser: (user: IUser | undefined | null) => void;
  setAccount: (account: IAccount | undefined | null) => void;
  logout: () => void;

  storeTokens: (
    access: string | undefined,
    refresh: string | undefined,
  ) => Promise<void>;
  clearTokens: () => void;
}

export function setInitialized(this: IStoreApi<IAuthState>, value: boolean) {
  const { set } = this;

  set(
    produce((state: IAuthState) => {
      state.initialized = value;
    }),
  );
}

export function isAuthenticated(this: IStoreApi<IAuthState>) {
  const { get } = this;

  return !!get().access;
}

export function setUser(
  this: IStoreApi<IAuthState>,
  user: IUser | undefined | null,
) {
  const { set } = this;

  set(
    produce((state: IAuthState) => {
      state.user = user;
    }),
  );
}

export function setAccount(
  this: IStoreApi<IAuthState>,
  account: IAccount | undefined | null,
) {
  const { set } = this;

  set(
    produce((state: IAuthState) => {
      state.account = account;
    }),
  );
}

export function logout(this: IStoreApi<IAuthState>) {
  const { set } = this;

  set(
    produce((state: IAuthState) => {
      state.user = undefined;
      state.account = undefined;
      state.access = undefined;
      state.refresh = undefined;
      state.initialized = false;
    }),
  );
}

export async function storeTokens(
  this: IStoreApi<IAuthState>,
  access: string | undefined,
  refresh: string | undefined,
) {
  const { set, get } = this;

  if (!access || !refresh) {
    get().clearTokens();
    return;
  }

  // Validate access token before storing
  try {
    if (isTokenExpired(access, 0)) {
      analytics.warn('Received expired access token, clearing tokens');
      get().clearTokens();
      return;
    }
  } catch (error) {
    analytics.error('Invalid access token format, clearing tokens', error);
    get().clearTokens();
    return;
  }

  if (access !== api.accessToken) {
    await api.setAccessToken(access);
  }

  set({ access, refresh });
}

export function clearTokens(this: IStoreApi<IAuthState>) {
  const { set } = this;

  set(
    produce((state: IAuthState) => {
      state.access = undefined;
      state.refresh = undefined;
    }),
  );
}
