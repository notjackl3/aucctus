import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Credentials, SignupDetails } from "./interfaces/user.interface";
import api from '../../libs/api'
import { RootState } from "../../app/store";
import analytics from "../../libs/analytics";
import { IUser } from "../../libs/api/typings";

export interface AuthState {
  status: "idle" | "loading" | "failed"
  user?: IUser;
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

/** Sign In
 * 
 */
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (credentials: Credentials, thunkApi) => {
    try {
      const { email, password } = credentials
      const response = await api.auth.signIn(email, password)
      if (response.resultType === 'success') {
        return response.data
      } else { // TODO: Handle error
        thunkApi.rejectWithValue(response.error)
      }
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
      const response = await api.auth.signup(name, email, password, confirmPassword)
      if (response.resultType === 'success') {
        return response.data
      } else {
        thunkApi.rejectWithValue(response.error)
      }
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
      const response = await api.auth.refreshToken()
      if (response.resultType === 'success') {
        return response.data
      } else {
        thunkApi.rejectWithValue(response.error)
      }
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
      const response = await api.auth.confirmEmail(token)
      if (response.resultType === 'success') {
        return response.data
      } else {
        thunkApi.rejectWithValue(response.error)
      }
    } catch (e) {
      analytics.debug(e)
    }
  }
)


export const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {

  },

  extraReducers: (builder) => {
    builder
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload?.user
        state.accessToken = action.payload?.accessToken
      })
      .addCase(confirmEmail.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload?.user
        state.accessToken = action.payload?.accessToken
      })
      .addCase(refreshAuth.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload?.user
        state.accessToken = action.payload?.accessToken
      })

  }
})


export const { } = authSlice.actions


export const selectUser = (state: RootState) => state.auth.user;


export default authSlice.reducer