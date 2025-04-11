import { mergeDeep, withLenses } from '@dhmk/zustand-lens';
import api from '@libs/api';
import { create, StoreApi } from 'zustand';
import { multiPersist } from 'zustand-multi-persist';
import { createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import aiEditingSlice, { IAiEditingState } from './ai-editing/store';
import authSlice, { IAuthState } from './auth/store';
import conceptIncubationSlice, {
  IConceptIncubationState,
} from './concept-incubation/store';
import conceptReportSlice, {
  IConceptReportState,
} from './concept-report/store';
import { AucctusStorage } from './utils/storage';
import customerProfileConversationsSlice, {
  ICustomerProfileConversationState,
} from './customer_profile_conversations/store';

export interface IAppStore {
  // global: IGlobalState;
  auth: IAuthState;
  incubation: IConceptIncubationState;
  aiEditing: IAiEditingState;
  conceptReport: IConceptReportState;
  customerProfileConversations: ICustomerProfileConversationState;
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
        aiEditing: aiEditingSlice,
        conceptReport: conceptReportSlice,
        customerProfileConversations: customerProfileConversationsSlice,
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
          aiEditing: state.aiEditing,
          conceptReport: state.conceptReport,
        }),
        merge: (persistedState: unknown, currentState: IAppStore): IAppStore =>
          mergeDeep(currentState, persistedState as IAppStore),
      },
    },
  ),
);

export default useStore;
