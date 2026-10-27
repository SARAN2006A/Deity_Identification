import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AboutPage from './components/AboutPage';
import StudioMainStage from './components/StudioMainStage';
import StudioDrawer from './components/StudioDrawer';

function AppContent() {
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [apiStatus, setApiStatus] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Poll backend health status
  useEffect(() => {
    const checkEngine = () => {
      fetch('/api/health', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setApiStatus(data.status === 'online' && data.model_loaded);
        })
        .catch(() => setApiStatus(false));
    };

    checkEngine();
    const interval = setInterval(checkEngine, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenTempleDossier = (temple) => {
    setActiveDrawer('temples');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  // Public pages manage their own header
  const isPublicPage = ['/', '/login', '/signup', '/about'].includes(location.pathname);

  return (
    <div className="studio-container">
      {/* Navigation Header — only shown in the authenticated app */}
      {!isPublicPage && (
        <Navbar
          onOpenDrawer={setActiveDrawer}
          apiStatus={apiStatus}
        />
      )}

      {/* Main Page Routing Stage — no padding on public pages */}
      <main className={isPublicPage ? '' : 'studio-stage'}>
        <Routes>
          <Route
            path="/"
            element={<LandingPage onOpenDrawer={setActiveDrawer} />}
          />
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="/signup"
            element={<SignupPage />}
          />
          <Route
            path="/about"
            element={<AboutPage />}
          />
          <Route
            path="/scanner"
            element={
              isAuthenticated ? (
                <StudioMainStage
                  onOpenTempleDossier={handleOpenTempleDossier}
                />
              ) : (
                <Navigate to="/login?redirect=/scanner" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={<Navigate to="/scanner" replace />}
          />
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>

      {/* Side-by-side slideout dossier drawer */}
      <StudioDrawer
        activeDrawer={activeDrawer}
        onClose={() => setActiveDrawer(null)}
        onSwitchDrawer={(name) => setActiveDrawer(name)}
      />

      {/* Footer (only on scanner or app pages if not landing) */}
      {location.pathname === '/scanner' && (
        <footer style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          borderTop: '1px solid var(--border-gold-subtle)',
          color: 'var(--text-muted)',
          fontSize: '0.84rem',
          background: 'rgba(7, 26, 43, 0.98)'
        }}>
          <div style={{ color: 'var(--gold-300)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            DeityVision AI &bull; Sacred Shilpa Shastra & Temple Heritage Engine
          </div>
          <div>
            PyTorch ResNet-50 Transfer Learning &bull; SQLite Persistence &bull; Deep Navy Gold Temple AI Studio
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
