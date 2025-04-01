import { mergeDeep, withLenses } from '@dhmk/zustand-lens';
import api from '@libs/api';
import { create, StoreApi } from 'zustand';
import { multiPersist } from 'zustand-multi-persist';
import { createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import authSlice, { IAuthState } from './auth/store';
import conceptIncubationSlice, {
  IConceptIncubationState,
} from './concept-incubation/store';
import { AucctusStorage } from './utils/storage';
export interface IAppStore {
  // global: IGlobalState;
  auth: IAuthState;
  incubation: IConceptIncubationState;
}

export interface IStoreApi<S> {
  get: StoreApi<S>['getState'];
  set: StoreApi<S>['setState'];
  storeApi: StoreApi<IAppStore>;
}

const useStore = create<IAppStore>()(
  multiPersist(
    subscribeWithSelector(
      withLenses({
        // global: globalSlice,
        auth: authSlice,
        incubation: conceptIncubationSlice,
      }),
    ),
    {
      local: {
        storage: createJSONStorage(
          () =>
            new AucctusStorage({
              storage: 'localStorage',
              encrypt: ['auth'],
            }),
        ),
        partialize: (state) => ({
          auth: {
            access: state.auth.access,
            refresh: state.auth.refresh,
            user: state.auth.user,
            account: state.auth.account,
          },
        }),
        merge: (
          persistedState: unknown,
          currentState: IAppStore,
        ): IAppStore => {
          const mergedState = mergeDeep(
            currentState,
            persistedState as IAppStore,
          );
          // If the access token is set, set it in the api to ensure connections are maintained
          if (mergedState.auth.access) {
            api.accessToken = mergedState.auth.access;
          }
          return mergedState;
        },
      },
      session: {
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          auth: {
            initialized: state.auth.initialized,
          },
          incubation: state.incubation,
        }),
        merge: (persistedState: unknown, currentState: IAppStore): IAppStore =>
          mergeDeep(currentState, persistedState as IAppStore),
      },
    },
  ),
);

export default useStore;
