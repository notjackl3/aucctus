import Page from '@pages';
import { useConceptReportRoutes, useSettingsRoutes } from '@routes/hooks';
import Layout from '@routes/layouts';
import { AppPath } from '@routes/routes';
import { Route } from 'react-router-dom';

const usePrivateRoutes = () => {
  const ConceptReportRoutes = useConceptReportRoutes();
  const SettingsRoutes = useSettingsRoutes();

  return (
    <Route element={<Layout.Private />}>
      <Route index path={AppPath.Home} element={<Page.Dashboard />} />
      <Route
        path={AppPath.IncubateConceptWithUuid}
        element={<Page.Concept.IncubateWrapper />}
      />
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
        <Route path='drafts' element={<Page.Concept.BankSeeds />} />
      </Route>

      {/* Concept Report */}
      {ConceptReportRoutes}

      {/* Settings Routes */}
      {SettingsRoutes}
    </Route>
  );
};

export default usePrivateRoutes;
