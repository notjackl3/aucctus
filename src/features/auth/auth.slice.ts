import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Credentials, User } from "./interfaces/user.interface";
import api from '../../libs/api'
import { RootState } from "../../app/store";

export interface AuthState {
  status: "idle" | "loading" | "failed"
  user?: User;

  // TODO: Access Token - Store token in http only secure cookie
  accessToken?: string
}

const initialState: AuthState = {
  status: "idle",
  user: undefined,
  accessToken: undefined
}

/** Sign In
 * 
 */
export const signIn = createAsyncThunk(
  "auth/login",
  async (credentials: Credentials) => {
    const { usernameOrEmail, password } = credentials
    const response = await api.auth.signIn(usernameOrEmail, password)
    return response
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
        if ("data" in action.payload) {
          state.accessToken = action.payload.data.accessToken
          state.user = action.payload.data.user
        } // TODO: handle error 
      })
  }
})


export const { } = authSlice.actions


export const selectUser = (state: RootState) => state.auth.user;


export default authSlice.reducer