import { mergeDeep, withLenses } from '@dhmk/zustand-lens';
import { create, StoreApi } from 'zustand';
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware';
import authSlice, { IAuthState } from './auth/store';
import globalSlice, { IGlobalState } from './global/store';
import conceptIncubationSlice, {
  IConceptIncubationState,
} from './concept-incubation/store';
import { AucctusStorage } from './storage';

export interface IAppStore {
  global: IGlobalState;
  auth: IAuthState;
  incubation: IConceptIncubationState;
}

export interface IStoreApi<S> {
  get: StoreApi<S>['getState'];
  set: StoreApi<S>['setState'];
  storeApi: StoreApi<IAppStore>;
}

const useStore = create<IAppStore>()(
  persist(
    subscribeWithSelector(
      withLenses({
        global: globalSlice,
        auth: authSlice,
        incubation: conceptIncubationSlice,
      }),
    ),
    {
      name: 'aucctus-store',
      storage: createJSONStorage(
        () =>
          new AucctusStorage({
            localStorage: ['auth'],
            sessionStorage: ['global', 'incubation'],
          }),
      ),

      // Only persist specific slices
      partialize: (state) => ({
        auth: state.auth,
        global: state.global,
        incubation: state.incubation,
      }),
      // Merge persisted state with current state to ensure all slices are hydrated
      merge: (persistedState: unknown, currentState: IAppStore): IAppStore =>
        mergeDeep(currentState, persistedState as IAppStore),
    },
  ),
);

export default useStore;
