
export const endpoints = {
  /* Auth */
  SignIn: '/api/auth/sign-in',
  Signup: "/api/auth/sign-up",
  Logout: "/api/auth/logout",
  Refresh: '/api/auth/refresh-access',
  Me: '/api/auth/me',
  Delete: "/api/users",
  GetUser: (id: string) => `/api/users/${id}`,
  confirmEmail: (token: string) => `/api/auth/confirm-email?token=${token}`,

  /* Organization */
  organization: `/api/organization`,
  registerOrganization: 'api/organization/register',
  organizationKpi: '/api/organization/kpi',
  organizationInnovationGoal: '/api/organization/innovation-goal',

  /* Ignite Concepts */
  igniteConcept: 'api/ignite-concept',
  specificIgniteConcept: (id: string) => `api/ignite-concept/${id}`,
  concept: 'api/ignite-concept/concept',
  specificConcept: (id: string) => `api/ignite-concept/concept/${id}`,
  saveSpecificConcept: (id: string) => `api/ignite-concept/concept/save/${id}`,
  deleteUnsavedConcepts: (igniteId: string) => `api/ignite-concept/unsaved/${igniteId}`,


  /* Ignite Domain */
  igniteDomain: 'chatbot/ignite-domain',

}