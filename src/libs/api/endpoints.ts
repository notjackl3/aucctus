
export const endpoints = {
  // Auth

  SignIn: '/api/auth/sign-in',
  Signup: "/api/auth/sign-up",
  Refresh: '/api/auth/refresh-access',
  Me: '/api/auth/me',
  Delete: "/api/users",
  GetUser: (id: string) => `/api/users/${id}`,
  confirmEmail: (token: string) => `/api/auth/confirm-email?token=${token}`,

  getOrganization: (id: string) => `/api/organization/${id}`,
  registerOrganization: 'api/organization/register',


  igniteDomain: 'chatbot/ignite-domain',

  igniteConcepts: 'chatbot/ignite-domain'

}