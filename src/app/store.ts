import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/auth.slice';
import { persistStore, persistReducer } from 'redux-persist';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import storage from 'redux-persist/lib/storage';
// import storageSession from 'redux-persist/lib/storage/session';

const authPersistConfig = {
  key: 'fhserw',
  storage: storage,
  blacklist: ['status', 'error', 'accessToken'],
};

const authPersistedReducer = persistReducer(authPersistConfig, authReducer);

const rootReducer = combineReducers({
  auth: authPersistedReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
