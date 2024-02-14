import {
  PayloadAction,
  createAsyncThunk,
  createSlice,
  isAnyOf,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';
import { Credentials, SignupDetails } from './interfaces/user.interface';
import api from '../../libs/api';
import { RootState } from '../../app/store';
import analytics from '../../libs/analytics';
import { IAccount, IAuthSuccessResponse, IRegisterAccount, IUser } from '../../libs/api/typings';
import { AxiosError, isAxiosError } from 'axios';
import { IFormDetailsError } from '../../libs/api/typings/avxisi';

export interface AuthState {
  status: 'idle' | 'loading' | 'failed';
  user?: IUser;
  account?: IAccount;
  accessToken?: string;
  error?: string;
}

const initialState: AuthState = {
  status: 'idle',
  user: undefined,
  error: '',
};

const isAPIAuthSuccessResponse = (action: PayloadAction<unknown>): action is PayloadAction<IAuthSuccessResponse> => {
  const payload = action.payload as IAuthSuccessResponse;
  return payload && !!payload.user && !!payload.token;
};

// TODO: Fix this error type
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

/** Sign Up
 *
 */
export const signUp = createAsyncThunk('auth/signUp', async (details: SignupDetails, thunkApi) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = details;
    return await api.auth.signup(firstName, lastName, email, password, confirmPassword);
  } catch (e) {
    analytics.debug(e);
    thunkApi.rejectWithValue(e);
  }
});

export const refreshAuth = createAsyncThunk('auth/refresh', async (_, thunkApi) => {
  analytics.debug('Refreshing Token');
  try {
    return await api.auth.refreshToken();
  } catch (e) {
    analytics.debug(e);
    thunkApi.rejectWithValue(e);
  }
});

export const registerAccount = createAsyncThunk('auth/registerAccount', async (account: IRegisterAccount, thunkApi) => {
  analytics.debug('Register Organization');
  try {
    const response = await api.account.createAccount(account);
    return response;
  } catch (e) {
    analytics.debug(e);
    thunkApi.rejectWithValue(e);
  }
});

export const confirmEmail = createAsyncThunk('auth/confirmEmail', async (token: string, thunkApi) => {
  analytics.debug('Confirming Email');
  try {
    return await api.auth.confirmEmail(token);
  } catch (e) {
    analytics.debug(e);
    thunkApi.rejectWithValue(e);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkApi) => {
  analytics.debug('Logout');
  try {
    return await api.auth.logout();
  } catch (e) {
    analytics.debug(e);
    thunkApi.rejectWithValue(e);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated(state: AuthState, action: PayloadAction<IAuthSuccessResponse>) {
      const { user, token } = action.payload;
      state.user = user;
      state.accessToken = token;
      api.accessToken = token;
    },
    setUnauthenticated(state: AuthState) {
      state.user = undefined;
      state.account = undefined;
      state.accessToken = undefined;
      api.accessToken = undefined;
    },
    setAccount(state: AuthState, action: PayloadAction<IAccount>) {
      state.account = action.payload;
      if (state.user && !state.user.account) {
        state.user = { ...state.user, account: action.payload.uuid };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerAccount.fulfilled, (state, action) => {
        analytics.debug(action.payload);
        state.account = action.payload;
        if (state.user && !state.user.account && action.payload) {
          state.user = { ...state.user, account: action.payload.uuid };
        }
      })
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
        const { user, token } = action.payload;
        analytics.debug(action.type);
        state.user = user;
        state.accessToken = token;
        api.accessToken = token;
      })
      .addMatcher(isAnyOf(isApiErrorResult), (state, action) => {
        const error = action.payload;
        if (error.response && error.response.status === 401) {
          state.user = undefined;
          state.account = undefined;
          state.accessToken = undefined;
          api.accessToken = undefined;
        }

        if (action.type !== 'auth/refresh') {
          state.error = error.message;
        }
      })
      .addMatcher(isAnyOf(logout.rejected, logout.fulfilled), (state) => {
        state.user = undefined;
        state.account = undefined;
        state.accessToken = undefined;
        api.accessToken = undefined;
      });
  },
});

export const { setAuthenticated, setUnauthenticated, setAccount } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectAccount = (state: RootState) => state.auth.account;
export const selectError = (state: RootState) => state.auth.error;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectAuthStatus = (state: RootState) => state.auth.status;

export default authSlice.reducer;
