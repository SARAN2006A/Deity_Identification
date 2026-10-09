import React, { useState, useEffect } from 'react';
import StudioHeader from './components/StudioHeader';
import StudioMainStage from './components/StudioMainStage';
import StudioDrawer from './components/StudioDrawer';

export default function App() {
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [apiStatus, setApiStatus] = useState(false);

  // Poll backend health
  useEffect(() => {
    const checkEngine = () => {
      fetch('/api/health')
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

  return (
    <div className="studio-container">
      <StudioHeader
        activeDrawer={activeDrawer}
        onOpenDrawer={setActiveDrawer}
        apiStatus={apiStatus}
      />

      <main className="studio-stage">
        <StudioMainStage
          onOpenTempleDossier={handleOpenTempleDossier}
        />
      </main>

      {/* Side-by-side slideout dossier drawer */}
      <StudioDrawer
        activeDrawer={activeDrawer}
        onClose={() => setActiveDrawer(null)}
      />

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
    </div>
  );
}
