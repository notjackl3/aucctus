import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import InputPage from './pages/InputPage';
import AnalysisPage from './pages/AnalysisPage';
import WorkspacePage from './pages/WorkspacePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import DecisionQuestionsPage from './pages/DecisionQuestionsPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<InputPage />} />
          <Route path="/analysis/:id" element={<AnalysisPage />} />
          <Route path="/workspace/:id" element={<WorkspacePage />} />
          <Route path="/workspace/:id/decisions" element={<DecisionQuestionsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
