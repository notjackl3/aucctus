import { configureStore, ThunkAction, Action, combineReducers, } from "@reduxjs/toolkit"
import authReducer from "../features/auth/auth.slice";
import conceptReducer from "../features/concepts/concept.slice";

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import storageSession from 'redux-persist/lib/storage/session'

const authPersistConfig = {
  key: 'fhserw',
  storage: storageSession,
  blacklist: ["status", 'error']
}

const conceptPersistConfig = {
  key: 'aasdnfsdfw',
  storage,
}



const authPersistedReducer = persistReducer(authPersistConfig, authReducer)
const conceptPersistedReducer = persistReducer(conceptPersistConfig, conceptReducer)

const rootReducer = combineReducers({
  auth: authPersistedReducer,
  concepts: conceptPersistedReducer
})



export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
  ,
})

export const persistor = persistStore(store)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
