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
      <Route path={AppPath.IgniteConcept} element={<Page.Concept.Ignite />} />
      <Route path={AppPath.ConceptSnapshot} element={<Page.Concept.Snapshot />} />
      <Route path={AppPath.GeneratedConcepts} element={<Page.Concept.Generated />} />
      <Route path={AppPath.ConceptBank} element={<Page.Concept.Bank />} />

      {/* Concept Report */}
      {ConceptReportRoutes}

      {/* Settings Routes */}
      {SettingsRoutes}
    </Route>
  );
};

export default usePrivateRoutes;
