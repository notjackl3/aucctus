

export enum AppPath {
  Home = '/',
  Onboarding = '/onboarding',

  /* Concepts */
  IgniteConcept = '/ignite-concept',
  GeneratedConcepts = '/ignite-concept/generated-concepts',
  ConceptOverview = '/concept/:id',

  /* Domain */
  DomainList = '/domain-list',
  IgniteDomain = '/ignite-domain',

  /* Auth */
  SignIn = "/sign-in",
  SignUp = "/sign-up",
  SignUpSuccess = "/confirm-email",
  ConfirmEmail = "/confirm-email/:token",
  ForgotPassword = "/forgot-password",

}