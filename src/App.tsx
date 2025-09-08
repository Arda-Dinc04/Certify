import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import CertificationsPage from './pages/CertificationsPage';
import RankingsPage from './pages/RankingsPage';
import ComparePage from './pages/ComparePage';
import CertificationDetailPage from './pages/CertificationDetailPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/certifications" element={<CertificationsPage />} />
          <Route path="/certifications/:slug" element={<CertificationDetailPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
