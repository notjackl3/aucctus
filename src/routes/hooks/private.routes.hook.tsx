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
      <Route path={AppPath.IgniteConcept} element={<Page.IgniteConcept />} />
      <Route path={AppPath.ConceptSnapshot} element={<Page.ConceptSnapshot />} />
      <Route path={AppPath.GeneratedConcepts} element={<Page.GeneratedConcepts />} />
      <Route path={AppPath.ConceptBank} element={<Page.Concept.Bank />} />

      {/* Concept Report */}
      {ConceptReportRoutes}

      {/* Settings Routes */}
      {SettingsRoutes}
    </Route>
  );
};

export default usePrivateRoutes;
