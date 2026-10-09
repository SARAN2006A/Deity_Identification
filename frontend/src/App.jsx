import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import StudioMainStage from './components/StudioMainStage';
import StudioDrawer from './components/StudioDrawer';

function AppContent() {
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [apiStatus, setApiStatus] = useState(false);
  const location = useLocation();

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

  return (
    <div className="studio-container">
      {/* Navigation Header */}
      <Navbar
        onOpenDrawer={setActiveDrawer}
        apiStatus={apiStatus}
      />

      {/* Main Page Routing Stage */}
      <main className="studio-stage">
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
            path="/scanner"
            element={
              <StudioMainStage
                onOpenTempleDossier={handleOpenTempleDossier}
              />
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
