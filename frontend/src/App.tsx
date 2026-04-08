import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import InputPage from './pages/InputPage';
import AnalysisPage from './pages/AnalysisPage';
import ResultsPage from './pages/ResultsPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<InputPage />} />
          <Route path="/analysis/:id" element={<AnalysisPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
