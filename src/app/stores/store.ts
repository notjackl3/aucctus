import { mergeDeep, withLenses } from '@dhmk/zustand-lens';
import { create, StoreApi } from 'zustand';
import { multiPersist } from 'zustand-multi-persist';
import { createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import telemetry from '@libs/telemetry';
import aiEditingSlice, {
  IAiEditingState,
  initialAiEditingState,
} from './ai-editing/store';
import authSlice, { IAuthState, initialAuthState } from './auth/store';
import conceptIncubationSlice, {
  IConceptIncubationState,
  initialIncubationState,
} from './concept-incubation/store';
import conceptReportSlice, {
  IConceptReportState,
  initialConceptReportState,
} from './concept-report/store';
import { AucctusStorage } from './utils/storage';
import customerProfileConversationsSlice, {
  ICustomerProfileConversationState,
  initialCustomerProfileConversationState,
} from './customer_profile_conversations/store';
import financialProjectionSlice, {
  IFinancialProjectionState,
  initialFinancialProjectionState,
} from './financial-projection/store';
import debugModeSlice, {
  IDebugModeState,
  initialDebugModeState,
} from './debug-mode/store';
import testCollateralSlice, {
  ITestCollateralState,
  initialTestCollateralState,
} from './testCollateral/store';
import nucleusAnswerSlice, {
  INucleusAnswerState,
  initialNucleusAnswerState,
} from './nucleus-answer/store';
import magicShareSlice, {
  IMagicShareState,
  initialMagicShareState,
} from './magic-share/store';
import ideaPlaygroundSlice, {
  IIdeaPlaygroundState,
  initialIdeaPlaygroundState,
} from './idea-playground/store';
import queryInvalidationSlice, {
  IQueryInvalidationState,
  initialQueryInvalidationState,
} from './query-invalidation/store';

import syntheticTestingSlice, {
  ISyntheticTestingState,
  initialSyntheticTestingState,
} from './synthetic-testing/store';
import overseerSlice, {
  IOverseerState,
  initialOverseerState,
} from './overseer/store';
import personaConversationsSlice, {
  IPersonaConversationState,
  initialPersonaConversationState,
} from './persona-conversations/store';

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
  overseer: IOverseerState;
  personaConversations: IPersonaConversationState;
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
        overseer: overseerSlice,
        personaConversations: personaConversationsSlice,
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
          conceptReport: {
            conceptUuid: state.conceptReport.conceptUuid,
            identifier: state.conceptReport.identifier,
            featureVersions: state.conceptReport.featureVersions,
            // pendingSectionOverrides excluded - it's optimistic UI state that should not survive refreshes
          },
          financialProjection: state.financialProjection,
          testCollateral: state.testCollateral,
          magicShare: state.magicShare, // Now safe to persist - snapshotUrl is just a URL, not base64
          ideaPlayground: {
            lastActiveSeedUuid: state.ideaPlayground.lastActiveSeedUuid,
          },
        }),
        merge: (persistedState: unknown, currentState: IAppStore): IAppStore =>
          mergeDeep(currentState, persistedState as IAppStore),
      },
    },
  ),
);

/**
 * Get true initial state values for reset (avoiding captured hydrated/persisted state)
 * This leverages the exported initial state constants from each slice to ensure
 * we have a single source of truth for initial values
 */
const getInitialState = (): IAppStore => {
  return {
    // Use exported initial state constants from each slice
    auth: initialAuthState as IAuthState,
    incubation: initialIncubationState as unknown as IConceptIncubationState,
    aiEditing: initialAiEditingState as unknown as IAiEditingState,
    conceptReport: initialConceptReportState as IConceptReportState,
    financialProjection:
      initialFinancialProjectionState as IFinancialProjectionState,
    customerProfileConversations:
      initialCustomerProfileConversationState as unknown as ICustomerProfileConversationState,
    debugMode: initialDebugModeState as IDebugModeState,
    testCollateral: initialTestCollateralState as ITestCollateralState,
    nucleusAnswer: initialNucleusAnswerState as unknown as INucleusAnswerState,
    magicShare: initialMagicShareState as unknown as IMagicShareState,
    ideaPlayground:
      initialIdeaPlaygroundState as unknown as IIdeaPlaygroundState,
    queryInvalidation:
      initialQueryInvalidationState as unknown as IQueryInvalidationState,
    syntheticTesting:
      initialSyntheticTestingState as unknown as ISyntheticTestingState,
    overseer: initialOverseerState as unknown as IOverseerState,
    personaConversations:
      initialPersonaConversationState as unknown as IPersonaConversationState,
  }; // Actions will be preserved automatically by Zustand's setState()
};

/**
 * Completely resets all Zustand store data and clears related persistence
 *
 * This function:
 * - Resets all store slices to their true initial state (not hydrated/persisted state)
 * - Clears Zustand-related storage keys from localStorage and sessionStorage
 * - Uses official Zustand setState(initialState, true) pattern for complete replacement
 * - Handles complex middleware stack (withLenses + multiPersist + subscribeWithSelector)
 * - Provides comprehensive error handling with telemetry logging
 * - Preserves all action methods automatically via Zustand's setState mechanism
 *
 * @example
 * ```typescript
 * import { resetAllStoreData } from '@app/stores/store';
 *
 * // Complete reset - clears everything back to true initial state
 * resetAllStoreData();
 * ```
 */
export const resetAllStoreData = (): void => {
  try {
    telemetry.log('🔄 Starting complete Zustand store reset...');

    // Step 1: Clear Zustand-related persistence layers first to prevent rehydration
    telemetry.debug('📦 Clearing Zustand persistence layers...');

    let clearedLocalStorageKeys = 0;
    let clearedSessionStorageKeys = 0;

    // Clear localStorage - target Zustand and multiPersist keys specifically
    try {
      const localStorageKeys = Object.keys(localStorage).filter(
        (key) =>
          key.includes('zustand') ||
          key.includes('multi-persist') ||
          key === 'local' || // multiPersist local storage key
          key === 'session' || // multiPersist session storage key
          key.toLowerCase().includes('store') ||
          key.toLowerCase().includes('persist'),
      );

      localStorageKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
          clearedLocalStorageKeys++;
          telemetry.debug(`✅ Cleared localStorage key: ${key}`);
        } catch (keyError) {
          telemetry.warn(
            `⚠️ Failed to clear localStorage key: ${key}`,
            keyError,
          );
        }
      });
    } catch (localStorageError) {
      telemetry.error(
        '❌ Error scanning/clearing localStorage:',
        localStorageError,
      );
    }

    // Clear sessionStorage - target Zustand and multiPersist keys specifically
    try {
      const sessionStorageKeys = Object.keys(sessionStorage).filter(
        (key) =>
          key.includes('zustand') ||
          key.includes('multi-persist') ||
          key === 'local' ||
          key === 'session' ||
          key.toLowerCase().includes('store') ||
          key.toLowerCase().includes('persist'),
      );

      sessionStorageKeys.forEach((key) => {
        try {
          sessionStorage.removeItem(key);
          clearedSessionStorageKeys++;
          telemetry.debug(`✅ Cleared sessionStorage key: ${key}`);
        } catch (keyError) {
          telemetry.warn(
            `⚠️ Failed to clear sessionStorage key: ${key}`,
            keyError,
          );
        }
      });
    } catch (sessionStorageError) {
      telemetry.error(
        '❌ Error scanning/clearing sessionStorage:',
        sessionStorageError,
      );
    }

    telemetry.log(
      `🗂️ Cleared ${clearedLocalStorageKeys} localStorage keys, ${clearedSessionStorageKeys} sessionStorage keys`,
    );

    // Step 2: Reset store to initial state using official Zustand pattern
    telemetry.debug('🔄 Resetting store state to initial values...');

    // Get fresh initial state (not captured hydrated state)
    const freshInitialState = getInitialState();

    // Use setState with replace=true for complete state replacement (not merge)
    // This is the official Zustand pattern and works correctly with all middleware
    useStore.setState(freshInitialState, true);

    telemetry.log('✅ Store state reset to initial values');
    telemetry.debug('📊 Current state after reset:', useStore.getState());

    telemetry.log('🎉 Complete Zustand store reset successful!');
  } catch (error) {
    telemetry.error('💥 Critical error during store reset:', error);

    // If reset fails catastrophically, log the error but don't throw
    // This prevents the error from breaking the calling code
    telemetry.warn(
      '⚠️ Store reset failed - application may be in inconsistent state',
    );

    // In extreme cases, you might want to force a page reload as a fallback
    // Uncomment the next line if you want that behavior:
    // window.location.reload();
  }
};

export default useStore;
