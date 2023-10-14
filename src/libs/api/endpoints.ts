
export const endpoints = {
  // Auth

  SignIn: 'api/auth/sign-in',
  Signup: "",
  Refresh: '/api/auth/refresh-access',
  Me: '/api/auth/me',
  Delete: "/api/users",
  GetUser: (idOrUsername: string) => `/api/users/${idOrUsername}`,



}