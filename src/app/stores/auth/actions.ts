import { IAccount, IUser } from '@libs/api/types';
import { produce } from 'immer';
import type { IStoreApi } from '../store';
import { IAuthState } from './store';
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
  // _access: string | undefined,
  // _refresh: string | undefined,
) {
  // This function is kept for backward compatibility but does nothing
  // All authentication is now handled by Clerk
  analytics.debug(
    'storeTokens called but JWT tokens are no longer used - using Clerk authentication',
  );
}

export function clearTokens(this: IStoreApi<IAuthState>) {
  // This function is kept for backward compatibility but does nothing
  // All authentication is now handled by Clerk
  analytics.debug(
    'clearTokens called but JWT tokens are no longer used - using Clerk authentication',
  );
}
