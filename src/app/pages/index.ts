import Auth from './Auth';
import Dashboard from './Dashboard';
import Onboarding from './Onboarding';
import SettingsPages from './Settings';
import TestingPages from './Testing';

import Concept from './Concept';
import IdeaPlayground from './IdeaPlayground';
// ComponentWorkshop is deprecated - use Concept Report Workshop tab instead
// import ComponentWorkshop from './ComponentWorkshop';
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
  // ComponentWorkshop is deprecated - use Concept Report Workshop tab instead
  // ComponentWorkshop,
  IdeaSubmissions,
  InnovationPipeline,
  SettingsPages,
  Testing: TestingPages,
  WatchtowerPage,
  CompetitorAssessmentPage,
};

export default Page;
