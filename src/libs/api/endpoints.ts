
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





  /* Ignite Concepts */
  igniteConcept: 'api/ignite-concept',
  getIgniteConcept: (id: string) => `api/ignite-concept/${id}`,
  concept: 'api/ignite-concept/concept',
  getConcept: (id: string) => `api/ignite-concept/concept/${id}`,
  getAllConcepts: (igniteId: string) => `api/ignite-concept/concept-all/${igniteId}`




}