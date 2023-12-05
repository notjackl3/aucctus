
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
  organizationCompetitors: '/api/organization/competitors',

  competitorNews: '/api/competitor-news',

  /* Ignite Concepts */
  igniteConcept: 'api/ignite-concept',
  specificIgniteConcept: (id: string) => `api/ignite-concept/${id}`,
  concept: 'api/ignite-concept/concept',
  specificConcept: (id: string) => `api/ignite-concept/concept/${id}`,
  saveSpecificConcept: (id: string) => `api/ignite-concept/concept/save/${id}`,
  deleteUnsavedConcepts: (igniteId: string) => `api/ignite-concept/unsaved/${igniteId}`,
  conceptOverview: (id: string) => `/api/ignite-concept/concept/overview/${id}`,
  conceptTargetGroups: (id: string) => `/api/ignite-concept/concept/${id}/target-group`,
  conceptCustomerProfile: (id: string, group: string) => `/api/ignite-concept/concept/${id}/customer-profile/${group}`,



  /* Ignite Domain */
  igniteDomain: 'api/ignite-domain',
  domainAll: `api/ignite-domain/domain`,
  domain: (id: string) => `api/ignite-domain/domain/${id}`,
  domainMarket: (id: string) => `api/ignite-domain/domain/market/${id}`,


  /* Challenges */
  challenge: 'api/challenge',
  challengeSpecific: (id: string) => `api/challenge/${id}`,

}