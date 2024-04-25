import {
  PayloadAction,
  createAsyncThunk,
  createSlice,
  isAnyOf,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';
import { Credentials } from './interfaces/user.interface';
import api from '../../libs/api';
import { RootState } from '../../app/store';
import analytics from '../../libs/analytics';
import { IAuthSuccessResponse, ITokenResponse } from '../../libs/api/types';
import { AxiosError, isAxiosError } from 'axios';
import { IFormDetailsError } from '../../libs/api/types';

export interface AuthState {
  status: 'idle' | 'loading' | 'failed';
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

const initialState: AuthState = {
  status: 'idle',
  error: '',
};

export const isAPIAuthSuccessResponse = (
  action: PayloadAction<unknown>
): action is PayloadAction<IAuthSuccessResponse> => {
  const payload = action.payload as IAuthSuccessResponse;
  return payload && !!payload.user && !!payload.access;
};

export const isAPIRefreshSuccessResponse = (
  action: PayloadAction<unknown>
): action is PayloadAction<ITokenResponse> => {
  const payload = action.payload as ITokenResponse;
  return payload && !!payload.access && !!payload.refresh;
};

const isApiErrorResult = (action: PayloadAction<unknown>): action is PayloadAction<AxiosError<IFormDetailsError>> => {
  const payload = action.payload as AxiosError<IFormDetailsError>;
  return payload && isAxiosError<IFormDetailsError>(payload);
};

/** Login
 *
 */
export const login = createAsyncThunk('auth/login', async (credentials: Credentials, thunkApi) => {
  try {
    const { email, password } = credentials;
    return await api.auth.login(email, password);
  } catch (e) {
    analytics.debug(e);
    thunkApi.rejectWithValue(e);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkApi) => {
  analytics.debug('Logout');
  try {
    const { auth } = thunkApi.getState() as RootState;
    return await api.auth.logout(auth.refreshToken);
  } catch (e) {
    analytics.debug(e);
    thunkApi.rejectWithValue(e);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    simpleLogout(state: AuthState) {
      state.accessToken = undefined;
      state.refreshToken = undefined;
      api.accessToken = undefined;
    },
    setAuthenticated(state: AuthState, action: PayloadAction<ITokenResponse>) {
      const { access, refresh } = action.payload;
      state.refreshToken = refresh;
      state.accessToken = access;
      api.accessToken = access;
    },
    setUnauthenticated(state: AuthState) {
      state.accessToken = undefined;
      api.accessToken = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isFulfilled, (state) => {
        state.status = 'idle';
      })
      .addMatcher(isPending, (state) => {
        state.status = 'loading';
      })
      .addMatcher(isRejected, (state) => {
        state.status = 'failed';
      })
      .addMatcher(isAnyOf(isAPIAuthSuccessResponse), (state, action) => {
        const { access, refresh } = action.payload;
        analytics.debug(action.type);
        state.accessToken = access;
        state.refreshToken = refresh;
        api.accessToken = access;
      })

      .addMatcher(isAnyOf(isApiErrorResult), (state, action) => {
        const error = action.payload;
        if (error.response && error.response.status === 401) {
          state.accessToken = undefined;
          state.refreshToken = undefined;
          api.accessToken = undefined;
        }

        if (action.type !== 'auth/refresh') {
          state.error = error.message;
        }
      })
      .addMatcher(isAnyOf(logout.rejected, logout.fulfilled), (state) => {
        state.accessToken = undefined;
        api.accessToken = undefined;
        state.refreshToken = undefined;
      });
  },
});

export const { setAuthenticated, setUnauthenticated, simpleLogout } = authSlice.actions;

export const selectError = (state: RootState) => state.auth.error;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const hasAccessToken = (state: RootState) => !!state.auth.accessToken && !!state.auth.refreshToken;
export const selectAuthStatus = (state: RootState) => state.auth.status;

export default authSlice.reducer;
