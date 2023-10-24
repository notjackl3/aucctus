

export enum AppPath {
  Home = '/',
  Onboarding = '/onboarding',

  /* Concepts */
  IgniteConcept = '/ignite-concept',
  GeneratedConcepts = '/ignite-concept/generated-concepts',
  ConceptOverview = '/concept/:id',

  /* Domain */
  IgniteDomain = '/ignite-domain',
  DomainList = '/domain-list',
  DomainMarket = '/domain/market/:id',



  /* Auth */
  SignIn = "/sign-in",
  SignUp = "/sign-up",
  SignUpSuccess = "/confirm-email",
  ConfirmEmail = "/confirm-email/:token",
  ForgotPassword = "/forgot-password",

}