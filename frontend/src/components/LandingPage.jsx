import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoldParticleCanvas from './GoldParticleCanvas';
import { Sparkles, Camera, Sun, Moon, Info } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('light-theme', !isDark);
  }, [isDark]);

  const handleGetStarted = () => navigate('/signup');
  const handleLogin = () => navigate('/login');
  const handleDemoDashboard = () => {
    if (isAuthenticated) {
      navigate('/scanner');
    } else {
      navigate('/login?redirect=/scanner');
    }
  };

  return (
    <div className="landing-page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ============ LANDING-ONLY NAVBAR ============ */}
      <header className="landing-navbar">
        <Link to="/" className="studio-brand" style={{ textDecoration: 'none' }}>
          <div className="studio-emblem">🛕</div>
          <div className="studio-title-group">
            <h1>Deity<span>Vision</span> AI</h1>
            <div className="studio-subtitle">South Indian Temple Heritage</div>
          </div>
        </Link>

        <div className="landing-nav-right">
          <button className="studio-nav-btn" onClick={() => navigate('/about')}>
            <Info size={15} /> About
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            title="Toggle Theme"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--gold-400)', padding: '0.4rem',
              display: 'flex', alignItems: 'center', borderRadius: '50%'
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isAuthenticated ? (
            <button className="btn-gold-royal auth-link-btn" onClick={() => navigate('/scanner')}>
              <Camera size={15} /> Open App
            </button>
          ) : (
            <div className="auth-btn-group">
              <button className="btn-obsidian-outline auth-link-btn" onClick={handleLogin}>Log In</button>
              <button className="btn-gold-royal auth-link-btn" onClick={handleGetStarted}>Get Started</button>
            </div>
          )}
        </div>
      </header>

      {/* ============ HERO SECTION ============ */}
      <section className="hero-section" style={{ flex: 1 }}>
        <GoldParticleCanvas />
        <div className="hero-content-container">
          <div className="hero-text-block fade-in">
            <div className="status-badge-pill">
              <span className="gem-pulse" style={{ background: '#22C55E' }}></span>
              <span>AI-Powered Sculpture Recognition</span>
            </div>
            <h1 className="hero-main-title serif-heading">
              Discover the Divine Through <span>Artificial Intelligence</span>
            </h1>
            <p className="hero-subtitle-desc">
              Explore South Indian temple heritage with AI-powered deity recognition,
              traditional iconography and an interactive temple knowledge vault.
            </p>
            <div className="hero-cta-group">
              {isAuthenticated ? (
                <button className="btn-gold-royal hero-btn-main" onClick={() => navigate('/scanner')}>
                  <Camera size={18} /> Open Dashboard
                </button>
              ) : (
                <>
                  <button className="btn-gold-royal hero-btn-main" onClick={handleGetStarted}>
                    <Sparkles size={18} /> Get Started — Free
                  </button>
                  <button className="btn-obsidian-outline hero-btn-sec" onClick={handleDemoDashboard}>
                    <Camera size={18} /> Demo Dashboard
                  </button>
                </>
              )}
            </div>
            <div className="hero-metrics-strip">
              <div className="hero-metric-item">
                <div className="metric-val">ResNet-50</div>
                <div className="metric-lbl">Transfer Learning</div>
              </div>
              <div className="metric-divider"></div>
              <div className="hero-metric-item">
                <div className="metric-val">4 Classes</div>
                <div className="metric-lbl">Sacred Iconography</div>
              </div>
              <div className="metric-divider"></div>
              <div className="hero-metric-item">
                <div className="metric-val">Grad-CAM</div>
                <div className="metric-lbl">Explainable AI</div>
              </div>
            </div>
            <div className="hero-feature-pills">
              <span className="feature-pill">🔱 Deity Recognition</span>
              <span className="feature-pill">🛕 Temple Vault</span>
              <span className="feature-pill">📖 Shilpa Shastras</span>
              <span className="feature-pill">🔍 Grad-CAM Heatmaps</span>
            </div>
          </div>

          <div className="hero-visual-block fade-in">
            <div className="sculpture-halo-container">
              <div className="golden-halo-ring halo-ring-1"></div>
              <div className="golden-halo-ring halo-ring-2"></div>
              <div className="sculpture-frame-display floating-animation">
                <div className="sculpture-emblem-large">🛕</div>
                <div className="sculpture-card-overlay">
                  <div className="overlay-tag">
                    <Sparkles size={13} color="var(--gold-300)" />
                    <span>Nataraja &bull; Cosmic Dancer</span>
                  </div>
                  <div className="overlay-tamil">நடராஜர் &bull; Shilpa Shastra</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ QUICK FEATURE STRIP ============ */}
      <section className="landing-feature-strip">
        <div className="feature-strip-inner">
          <div className="strip-card">
            <div className="strip-icon">🤖</div>
            <div>
              <div className="strip-title">AI Scanner</div>
              <div className="strip-desc">Upload a deity sculpture — ResNet-50 identifies it instantly</div>
            </div>
          </div>
          <div className="strip-divider"></div>
          <div className="strip-card">
            <div className="strip-icon">🛕</div>
            <div>
              <div className="strip-title">Temple Vault</div>
              <div className="strip-desc">Deep heritage intel on major South Indian temples</div>
            </div>
          </div>
          <div className="strip-divider"></div>
          <div className="strip-card">
            <div className="strip-icon">📖</div>
            <div>
              <div className="strip-title">Shilpa Shastras</div>
              <div className="strip-desc">Classical iconography in English &amp; Tamil</div>
            </div>
          </div>
          <div className="strip-divider"></div>
          <div className="strip-card">
            <div className="strip-icon">📊</div>
            <div>
              <div className="strip-title">Scan Vault</div>
              <div className="strip-desc">Personal scan history &amp; analytics</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="landing-final-cta">
        <div className="landing-final-cta-card text-center">
          <div className="heritage-ornament">BEGIN YOUR JOURNEY</div>
          <h2 className="serif-heading" style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Ready to Explore <span style={{ color: 'var(--gold-300)' }}>Temple Heritage?</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.8rem', maxWidth: 520, margin: '0 auto 1.8rem' }}>
            Create a free account and start identifying South Indian deity sculptures with deep learning AI.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <button className="btn-gold-royal btn-large-cta" onClick={() => navigate('/scanner')}>
                <Camera size={18} /> Go to Dashboard
              </button>
            ) : (
              <>
                <button className="btn-gold-royal btn-large-cta" onClick={handleGetStarted}>
                  <Sparkles size={18} /> Create Free Account
                </button>
                <button className="btn-obsidian-outline btn-large-cta" onClick={handleLogin}>Log In</button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="landing-footer">
        <div className="footer-top-grid">
          <div className="footer-brand-col">
            <div className="studio-brand">
              <div className="studio-emblem">🛕</div>
              <div className="studio-title-group">
                <h1>Deity<span>Vision</span> AI</h1>
                <div className="studio-subtitle">Shilpa Shastra Intelligence Engine</div>
              </div>
            </div>
            <p className="footer-about-text">
              Full-stack AI platform combining computer vision with authentic South Indian temple iconography research.
            </p>
          </div>
          <div className="footer-links-col">
            <h4 className="footer-col-title serif-heading">Navigate</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/login">Log In</Link></li>
              <li><Link to="/signup">Register</Link></li>
            </ul>
          </div>
          <div className="footer-links-col">
            <h4 className="footer-col-title serif-heading">Technology</h4>
            <ul>
              <li>PyTorch &amp; ResNet-50</li>
              <li>Explainable AI Grad-CAM</li>
              <li>Flask REST &amp; SQLite</li>
              <li>React 18 &amp; Vite</li>
            </ul>
          </div>
          <div className="footer-links-col">
            <h4 className="footer-col-title serif-heading">Research</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Designed for educational exploration and preservation of South Indian temple sculptural heritage.
            </p>
          </div>
        </div>
        <div className="footer-bottom-bar text-center">
          <div>&copy; {new Date().getFullYear()} DeityVision AI &bull; All Rights Reserved</div>
        </div>
      </footer>
    </div>
  );
}
