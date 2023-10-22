import { PayloadAction, createAsyncThunk, createSlice, isAnyOf, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import { Credentials, SignupDetails } from "./interfaces/user.interface";
import api from '../../libs/api'
import { RootState } from "../../app/store";
import analytics from "../../libs/analytics";
import { IAuthSuccessResponse, IUser } from "../../libs/api/typings";
import { IApiErrorResult, IApiSuccessResult } from "../../libs/api/apiService";
import { AxiosError, isAxiosError } from "axios";

export interface AuthState {
  status: "idle" | "loading" | "failed"
  user?: IUser;
  organization?: IOrganization;
  error?: string;

  // TODO: Access Token - Store token in http only secure cookie
  accessToken?: string
}

const initialState: AuthState = {
  status: "idle",
  user: undefined,
  accessToken: undefined,
  error: ""
}

const isAPIAuthSuccessResponse = (action: PayloadAction<unknown>): action is PayloadAction<IApiSuccessResult<IAuthSuccessResponse>> => {
  const payload = action.payload as IApiSuccessResult<IAuthSuccessResponse>
  return payload && "resultType" in payload && payload.resultType === 'success' && payload.data.user !== undefined && payload.data.accessToken !== undefined
}

const isApiErrorResult = (action: PayloadAction<unknown>): action is PayloadAction<IApiErrorResult<AxiosError>> => {
  const payload = action.payload as IApiErrorResult<AxiosError>
  return payload && "resultType" in payload && payload.resultType === 'fail' && isAxiosError(payload.error)
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
    }
  }
)

export const registerOrganization = createAsyncThunk(
  "auth/registerOrganization",
  async (organization: IRegisterOrganization, thunkApi) => {
    analytics.debug('Register Organization')
    try {
      return await api.auth.registerOrganization(organization)
    } catch (e) {
      analytics.debug(e)
    }
  },
)


export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
          state.user = action.payload.data.user
          state.organization = action.payload.data.organization
          // TODO: Add api interceptor to grab this
          api.accessToken = action.payload.data.accessToken
        }
      ).addMatcher(
        isAnyOf(isApiErrorResult), (state, action) => {
          const error = action.payload.error
          // if (error.response?.request)
          state.error = error.message
        }
      )
  }
})


export const { } = authSlice.actions


export const selectUser = (state: RootState) => state.auth.user;
export const selectOrganization = (state: RootState) => state.auth.organization
export const selectError = (state: RootState) => state.auth.error

export default authSlice.reducer