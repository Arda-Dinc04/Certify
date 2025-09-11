import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navigation from './components/Navigation';
import { CompareProvider } from './context/CompareContext';
import LoadingSpinner from './components/LoadingSpinner';
import SkipToContent from './components/SkipToContent';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const CertificationsPage = lazy(() => import('./pages/CertificationsPage'));
const RankingsPage = lazy(() => import('./pages/RankingsPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const CertificationDetailPage = lazy(() => import('./pages/CertificationDetailPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));

function App() {
  return (
    <CompareProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <SkipToContent />
          <Navigation />
          <main id="main-content" role="main">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/certifications" element={<CertificationsPage />} />
                <Route path="/cert/:slug" element={<CertificationDetailPage />} />
                <Route path="/rankings" element={<RankingsPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/compare" element={<ComparePage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </CompareProvider>
  );
}

export default App;
