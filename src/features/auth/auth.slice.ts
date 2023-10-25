import { PayloadAction, createAsyncThunk, createSlice, isAnyOf, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import { Credentials, SignupDetails } from "./interfaces/user.interface";
import api from '../../libs/api'
import { RootState } from "../../app/store";
import analytics from "../../libs/analytics";
import { IAuthSuccessResponse, IUser } from "../../libs/api/typings";
import { AxiosError, isAxiosError } from "axios";
import { INestJSErrorResponse } from "../../libs/api/typings/avxisi";

export interface AuthState {
  status: "idle" | "loading" | "failed"
  user?: IUser;
  accessToken?: string;
  organization?: IOrganization;
  error?: string;

}

const initialState: AuthState = {
  status: "idle",
  user: undefined,
  error: ""
}



const isAPIAuthSuccessResponse = (action: PayloadAction<unknown>): action is PayloadAction<IAuthSuccessResponse> => {
  const payload = action.payload as IAuthSuccessResponse
  return payload && payload.user !== undefined && payload.accessToken !== undefined
}

const isApiErrorResult = (action: PayloadAction<unknown>): action is PayloadAction<AxiosError<INestJSErrorResponse>> => {
  const payload = action.payload as AxiosError<INestJSErrorResponse>
  return payload && isAxiosError<INestJSErrorResponse>(payload)
}

/** Sign In
 * 
 */
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (credentials: Credentials, thunkApi) => {
    try {
      const { email, password } = credentials
      return await api.auth.signIn(email, password)
    } catch (e) {
      analytics.debug(e)
      thunkApi.rejectWithValue(e)
    }
  }
)

/** Sign Up
 * 
 */
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (details: SignupDetails, thunkApi) => {
    try {
      const { name, email, password, confirmPassword } = details
      return await api.auth.signup(name, email, password, confirmPassword)
    } catch (e) {
      analytics.debug(e)
      thunkApi.rejectWithValue(e)
    }
  }
)

export const refreshAuth = createAsyncThunk(
  "auth/refresh",
  async (_, thunkApi) => {
    analytics.debug('Refreshing Token')
    try {
      return await api.auth.refreshToken()
    } catch (e) {
      analytics.debug(e)
      thunkApi.rejectWithValue(e)
    }
  }
)

export const confirmEmail = createAsyncThunk(
  "auth/confirmEmail",
  async (token: string, thunkApi) => {
    analytics.debug('Confirming Email')
    try {
      return await api.auth.confirmEmail(token)
    } catch (e) {
      analytics.debug(e)
      thunkApi.rejectWithValue(e)
    }
  }
)

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, thunkApi) => {
    analytics.debug('Logout')
    try {
      return await api.auth.logout()
    } catch (e) {
      analytics.debug(e)
      thunkApi.rejectWithValue(e)
    }
  },
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated(state, action: PayloadAction<IAuthSuccessResponse>) {
      state.user = action.payload.user
      state.organization = action.payload.organization
      state.accessToken = action.payload.accessToken
      api.accessToken = action.payload.accessToken
    },
    setUnauthenticated(state) {
      state.user = undefined
      state.organization = undefined
      state.accessToken = undefined
      api.accessToken = undefined
    },
    registerOrganization(state, action: PayloadAction<IOrganizationSuccessResponse>) {
      state.organization = action.payload.organization
    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = undefined;
        state.organization = undefined
        state.accessToken = undefined
        api.accessToken = undefined
      })
      .addCase(refreshAuth.fulfilled, () => {
        analytics.debug('Refresh Success')
      })

      .addMatcher(isFulfilled, (state, action) => {
        state.status = 'idle'
      })
      .addMatcher(isPending, (state, action) => {
        state.status = 'loading'
      })
      .addMatcher(isRejected, (state, action) => {
        state.status = 'failed'
      })
      .addMatcher(
        isAnyOf(isAPIAuthSuccessResponse), (state, action) => {
          state.user = action.payload.user
          state.organization = action.payload.organization
          state.accessToken = action.payload.accessToken
          // TODO: Add api interceptor to grab this
          api.accessToken = action.payload.accessToken
        }
      ).addMatcher(
        isAnyOf(isApiErrorResult), (state, action) => {
          const error = action.payload
          if (error.response && error.response.status === 401) {
            state.user = undefined
            state.organization = undefined
            state.accessToken = undefined
            api.accessToken = undefined
          }

          if (action.type !== "auth/refresh") {
            state.error = error.message
          }
        }
      )
  }
})


export const { setAuthenticated, setUnauthenticated, registerOrganization } = authSlice.actions

export const selectUser = (state: RootState) => state.auth.user;
export const selectOrganization = (state: RootState) => state.auth.organization
export const selectError = (state: RootState) => state.auth.error
export const selectAccessToken = (state: RootState) => state.auth.accessToken

export default authSlice.reducer