import Auth from './Auth';
import Dashboard from './Dashboard';
import Onboarding from './Onboarding';
import SettingsPages from './Settings';
import TestingPages from './Testing';

import Concept from './Concept';
import IdeaPlayground from './IdeaPlayground';
import IdeaSubmissions from './IdeaSubmissions';
import InnovationPipeline from './InnovationPipeline';
import { WatchtowerPage } from './Watchtower';
import { CompetitorAssessmentPage } from './CompetitorAssessment';

const Page = {
  Auth,
  Dashboard,
  Onboarding,
  Concept,
  IdeaPlayground,
  IdeaSubmissions,
  InnovationPipeline,
  SettingsPages,
  Testing: TestingPages,
  WatchtowerPage,
  CompetitorAssessmentPage,
};

export default Page;
