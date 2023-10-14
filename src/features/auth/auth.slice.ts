import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Credentials, User } from "./interfaces/user.interface";
import api from '../../libs/api'
import { RootState } from "../../app/store";

export interface AuthState {
  status: "idle" | "loading" | "failed"
  user?: User;
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
  "auth/login",
  async (credentials: Credentials, thunkApi) => {
    try {
      const { usernameOrEmail, password } = credentials
      const response = await api.auth.signIn(usernameOrEmail, password)
      if (response.resultType === 'success') {
        return response.data
      } else {
        throw response.error
      }
    } catch (e) {
      thunkApi.rejectWithValue(e)
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
      .addCase(signIn.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(signIn.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload?.user
        state.accessToken = action.payload?.accessToken
      })
  }
})


export const { } = authSlice.actions


export const selectUser = (state: RootState) => state.auth.user;


export default authSlice.reducer