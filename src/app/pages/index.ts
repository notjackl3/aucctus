import React from 'react';
import Auth from './Auth';
import ConceptPages from './ConceptReport';
import SettingsPages from './Settings';

const Dashboard = React.lazy(() => import('./Dashboard'));
const NotFound = React.lazy(() => import('./NotFound'));
const Onboarding = React.lazy(() => import('./Onboarding'));
const Concepts = React.lazy(() => import('./Concepts'));
const IgniteConcept = React.lazy(() => import('./IgniteConcept'));
const ConceptSnapshot = React.lazy(() => import('./ConceptSnapshot'));
const GeneratedConcepts = React.lazy(() => import('./GeneratedConcepts'));

const Page = {
  Auth,
  NotFound,
  Dashboard,
  Onboarding,
  Concepts,
  IgniteConcept,
  GeneratedConcepts,
  ConceptPages,
  ConceptSnapshot,
  SettingsPages,
};

export default Page;
