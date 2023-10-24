

export enum AppPath {
  Home = '/',
  Onboarding = '/onboarding',

  /* Concepts */
  IgniteConcept = '/ignite-concept',
  GeneratedConcepts = '/ignite-concept/generated-concepts',
  ConceptList = '/concept-list',
  ConceptOverview = '/concept/:id',


  /* Domain */
  IgniteDomain = '/ignite-domain',
  DomainList = '/domain-list',
  DomainMarket = '/domain/:id',



  /* Auth */
  SignIn = "/sign-in",
  SignUp = "/sign-up",
  SignUpSuccess = "/confirm-email",
  ConfirmEmail = "/confirm-email/:token",
  ForgotPassword = "/forgot-password",

}