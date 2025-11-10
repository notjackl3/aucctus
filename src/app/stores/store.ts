import { mergeDeep, withLenses } from '@dhmk/zustand-lens';
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
import financialProjectionSlice, {
  IFinancialProjectionState,
} from './financial-projection/store';
import debugModeSlice, { IDebugModeState } from './debug-mode/store';
import testCollateralSlice, {
  ITestCollateralState,
} from './testCollateral/store';
import nucleusAnswerSlice, {
  INucleusAnswerState,
} from './nucleus-answer/store';
import magicShareSlice, { IMagicShareState } from './magic-share/store';
import ideaPlaygroundSlice, {
  IIdeaPlaygroundState,
} from './idea-playground/store';
import queryInvalidationSlice, {
  IQueryInvalidationState,
} from './query-invalidation/store';

import syntheticTestingSlice, {
  ISyntheticTestingState,
} from './synthetic-testing/store';

export interface IAppStore {
  // global: IGlobalState;
  auth: IAuthState;
  incubation: IConceptIncubationState;
  aiEditing: IAiEditingState;
  conceptReport: IConceptReportState;
  financialProjection: IFinancialProjectionState;
  customerProfileConversations: ICustomerProfileConversationState;
  debugMode: IDebugModeState;
  testCollateral: ITestCollateralState;
  nucleusAnswer: INucleusAnswerState;
  magicShare: IMagicShareState;
  ideaPlayground: IIdeaPlaygroundState;
  queryInvalidation: IQueryInvalidationState;
  syntheticTesting: ISyntheticTestingState;
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
        financialProjection: financialProjectionSlice,
        customerProfileConversations: customerProfileConversationsSlice,
        debugMode: debugModeSlice,
        testCollateral: testCollateralSlice,
        nucleusAnswer: nucleusAnswerSlice,
        magicShare: magicShareSlice,
        ideaPlayground: ideaPlaygroundSlice,
        queryInvalidation: queryInvalidationSlice,
        syntheticTesting: syntheticTestingSlice,
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
          financialProjection: {
            marketSizingAssumptions:
              state.financialProjection.marketSizingAssumptions,
            impactSizingAssumptions:
              state.financialProjection.impactSizingAssumptions,
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
          // JWT token management removed - using Clerk authentication only
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
          financialProjection: state.financialProjection,
          testCollateral: state.testCollateral,
          magicShare: state.magicShare, // Now safe to persist - snapshotUrl is just a URL, not base64
        }),
        merge: (persistedState: unknown, currentState: IAppStore): IAppStore =>
          mergeDeep(currentState, persistedState as IAppStore),
      },
    },
  ),
);

export default useStore;
