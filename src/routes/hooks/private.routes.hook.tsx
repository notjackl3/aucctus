import { NucleusPage } from '@components';
import Page from '@pages';
import { useConceptReportRoutes, useSettingsRoutes } from '@routes/hooks';
import Layout from '@routes/layouts';
import { AppPath } from '@routes/routes';
import { Navigate, Route } from 'react-router-dom';

const usePrivateRoutes = () => {
  const ConceptReportRoutes = useConceptReportRoutes();
  const SettingsRoutes = useSettingsRoutes();

  return (
    <Route element={<Layout.Private />}>
      {/* Redirect root to Concept Bank */}
      <Route index element={<Navigate to={AppPath.ConceptBank} replace />} />
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
        <Route
          path='submissions'
          element={<Page.IdeaSubmissions.SubmissionsTab />}
        />
        <Route
          path='submissions/:linkUuid'
          element={<Page.IdeaSubmissions.SubmissionLinkDetailPage />}
        />
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

      {/* Idea Submissions Admin Panel */}
      <Route
        path={AppPath.IdeaSubmissionsAdmin}
        element={<Page.IdeaSubmissions.AdminPanel />}
      />

      {/* Submission Links Management - redirects to Concept Bank Submissions */}
      <Route
        path={AppPath.SubmissionLinks}
        element={<Page.IdeaSubmissions.SubmissionsTab />}
      />
      <Route
        path={AppPath.SubmissionLinkDetail}
        element={<Page.IdeaSubmissions.SubmissionLinkDetailPage />}
      />

      {/* Watchtower Routes */}
      <Route path={AppPath.Watchtower} element={<Page.WatchtowerPage />} />

      {/* Competitor Assessment Routes - disabled, feature dormant */}
      {/* {isAdmin && (
        <Route
          path={AppPath.CompetitorAssessment}
          element={<Page.CompetitorAssessmentPage />}
        />
      )} */}
    </Route>
  );
};

export default usePrivateRoutes;
