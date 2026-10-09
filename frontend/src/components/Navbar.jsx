import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Camera,
  Landmark,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({ onOpenDrawer, apiStatus }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDarkMode]);

  const handleNavClick = (path, drawerName = null) => {
    setMobileMenuOpen(false);
    if (drawerName && onOpenDrawer) {
      if (location.pathname !== '/scanner') {
        navigate('/scanner');
      }
      onOpenDrawer(drawerName);
    } else if (path) {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const isScannerActive = location.pathname === '/scanner';
  const isHomeActive = location.pathname === '/';
  const isAboutActive = location.pathname === '/about';

  return (
    <header className="studio-header">
      {/* Brand Logo & Name */}
      <Link to="/" className="studio-brand" onClick={() => setMobileMenuOpen(false)}>
        <div className="studio-emblem">🛕</div>
        <div className="studio-title-group">
          <h1>Deity<span>Vision</span> AI</h1>
          <div className="studio-subtitle">South Indian Temple Heritage</div>
        </div>
      </Link>

      {/* Desktop Navigation Links */}
      <nav className="desktop-nav-links">
        <button
          className={`studio-nav-btn ${isHomeActive ? 'active' : ''}`}
          onClick={() => handleNavClick('/')}
        >
          Home
        </button>

        {isAuthenticated && (
          <>
            <button
              className={`studio-nav-btn ${isScannerActive ? 'active' : ''}`}
              onClick={() => handleNavClick('/scanner')}
            >
              <Camera size={15} /> AI Scanner
            </button>

            <button
              className="studio-nav-btn"
              onClick={() => handleNavClick('/scanner', 'temples')}
            >
              <Landmark size={15} /> Temple Vault
            </button>

            <button
              className="studio-nav-btn"
              onClick={() => handleNavClick('/scanner', 'shastras')}
            >
              <BookOpen size={15} /> Shilpa Shastras
            </button>
          </>
        )}

        <button
          className={`studio-nav-btn ${isAboutActive ? 'active' : ''}`}
          onClick={() => handleNavClick('/about')}
        >
          About
        </button>
      </nav>

      {/* Auth Actions & Telemetry Badge */}
      <div className="header-right-actions">
        {/* Theme Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Light/Dark Mode"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gold-400)', padding: '0.4rem', borderRadius: '50%'
          }}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Status Telemetry */}
        <div className="studio-telemetry" title={apiStatus ? 'Model Online' : 'Connecting to AI Engine'}>
          <span className="gem-pulse" style={{ background: apiStatus ? '#22C55E' : '#EAB308' }}></span>
          <span style={{ fontSize: '0.76rem' }}>{apiStatus ? 'ResNet-50 Active' : 'Connecting'}</span>
        </div>

        {isAuthenticated ? (
          <div className="user-profile-menu-container" style={{ position: 'relative' }}>
            <button
              className="btn-obsidian-outline profile-badge-btn"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.95rem' }}
            >
              <div className="user-avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="user-display-name" style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                {user?.name || 'Explorer'}
              </span>
              <ChevronDown size={14} color="var(--gold-400)" />
            </button>

            {userDropdownOpen && (
              <div className="user-dropdown-popover fade-in">
                <div className="dropdown-user-header">
                  <div className="dropdown-user-name">{user?.name}</div>
                  <div className="dropdown-user-email">{user?.email}</div>
                </div>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item-btn"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    handleNavClick('/scanner', 'history');
                  }}
                >
                  <Shield size={15} /> My Saved Scans
                </button>
                <button
                  className="dropdown-item-btn logout-danger"
                  onClick={handleLogout}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-btn-group">
            <Link to="/login" className="btn-obsidian-outline auth-link-btn" onClick={() => setMobileMenuOpen(false)}>
              Log In
            </Link>
            <Link to="/signup" className="btn-gold-royal auth-link-btn" onClick={() => setMobileMenuOpen(false)}>
              Get Started
            </Link>
          </div>
        )}

        {/* Mobile Menu Toggle Button */}
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={22} color="var(--gold-300)" /> : <Menu size={22} color="var(--gold-300)" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay fade-in">
          <div className="mobile-nav-panel">
            <div className="mobile-nav-header">
              <span className="serif-heading" style={{ color: 'var(--gold-200)' }}>Navigation Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}>
                <X size={20} />
              </button>
            </div>
            <div className="mobile-nav-links">
              <button className="mobile-nav-item" onClick={() => handleNavClick('/')}>
                Home
              </button>
              {isAuthenticated && (
                <>
                  <button className="mobile-nav-item" onClick={() => handleNavClick('/scanner')}>
                    <Camera size={16} /> AI Scanner
                  </button>
                  <button className="mobile-nav-item" onClick={() => handleNavClick('/scanner', 'temples')}>
                    <Landmark size={16} /> Temple Vault
                  </button>
                  <button className="mobile-nav-item" onClick={() => handleNavClick('/scanner', 'shastras')}>
                    <BookOpen size={16} /> Iconography & Shilpa Shastras
                  </button>
                </>
              )}
              <button className="mobile-nav-item" onClick={() => handleNavClick('/about')}>
                About
              </button>

              <div style={{ height: '1px', background: 'var(--border-gold-subtle)', margin: '0.8rem 0' }}></div>

              {isAuthenticated ? (
                <>
                  <div style={{ padding: '0.5rem 0', color: 'var(--gold-300)', fontWeight: 700, fontSize: '0.9rem' }}>
                    Signed in as {user?.name}
                  </div>
                  <button className="mobile-nav-item logout-danger" onClick={handleLogout}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <Link to="/login" className="btn-obsidian-outline" style={{ textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>
                    Log In
                  </Link>
                  <Link to="/signup" className="btn-gold-royal" style={{ textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
