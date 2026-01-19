import Page from '@pages';
import { useConceptReportRoutes, useSettingsRoutes } from '@routes/hooks';
import Layout from '@routes/layouts';
import { AppPath } from '@routes/routes';
import { Route } from 'react-router-dom';
import { NucleusPage } from '@components';

const usePrivateRoutes = () => {
  const ConceptReportRoutes = useConceptReportRoutes();
  const SettingsRoutes = useSettingsRoutes();

  return (
    <Route element={<Layout.Private />}>
      <Route index path={AppPath.Home} element={<Page.Dashboard />} />
      <Route
        path={AppPath.IncubateConcept}
        element={<Page.Concept.Incubate />}
      />
      <Route
        path={AppPath.GeneratedConcepts}
        element={<Page.Concept.BankConcepts />}
      />

      {/* Concept Bank with Outlet pattern */}
      <Route path={AppPath.ConceptBank} element={<Page.Concept.Bank />}>
        <Route index element={<Page.Concept.BankConcepts />} />
        <Route path='portfolio' element={<Page.Concept.Portfolio />} />
        <Route path='drafts' element={<Page.Concept.BankSeeds />} />
      </Route>

      {/* Concept Report */}
      {ConceptReportRoutes}

      {/* Settings Routes */}
      {SettingsRoutes}

      {/* Nucleus Routes */}
      <Route path={AppPath.Nucleus} element={<NucleusPage />} />

      {/* Idea Playground Routes */}
      <Route
        path={AppPath.IdeaPlayground}
        element={<Page.IdeaPlayground.IdeaPlaygroundQBased />}
      />

      {/* Testing/Demo Routes */}
      <Route
        path={AppPath.TestingConceptOverview}
        element={<Page.Testing.ConceptOverviewTesting />}
      />
    </Route>
  );
};

export default usePrivateRoutes;
