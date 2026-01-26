import Auth from './Auth';
import Dashboard from './Dashboard';
import Onboarding from './Onboarding';
import SettingsPages from './Settings';
import TestingPages from './Testing';

import Concept from './Concept';
import IdeaPlayground from './IdeaPlayground';
import IdeaSubmissions from './IdeaSubmissions';
import InnovationPipeline from './InnovationPipeline';
import SignalScanning from './SignalScanning';
import { WatchtowerPage, WatchtowerInitiationPage } from './Watchtower';

const Page = {
  Auth,
  Dashboard,
  Onboarding,
  Concept,
  IdeaPlayground,
  IdeaSubmissions,
  InnovationPipeline,
  SignalScanning,
  SettingsPages,
  Testing: TestingPages,
  WatchtowerPage,
  WatchtowerInitiationPage,
};

export default Page;
