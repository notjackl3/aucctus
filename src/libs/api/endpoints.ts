export const endpoints = {
  /* Auth */
  login: '/api/v1/login',
  signup: '/api/v1/sign-up',
  logout: '/api/v1/logout',
  refresh: '/api/v1/token/refresh',

  user: '/api/v1/user',
  confirmEmail: `/api/v1/confirm-email`,
  forgotPassword: `/api/v1/forgot-password`,

  /* Account */
  account: `/api/v1/account`,

  /* Ignite Concepts */
  igniteConcept: 'api/v1/concept/generate',
  concept: 'api/v1/concept',
};
