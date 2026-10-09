import React from 'react';
import { Camera, Compass, BookOpen, Clock, BarChart3, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, apiStatus }) {
  const navTabs = [
    { id: 'scanner', label: 'AI Scanner', icon: Camera },
    { id: 'temples', label: 'Temple Explorer', icon: Compass },
    { id: 'encyclopedia', label: 'Iconography Guide', icon: BookOpen },
    { id: 'history', label: 'Scan History', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="app-header">
      <div className="brand-wrapper" onClick={() => setActiveTab('scanner')}>
        <div className="brand-icon">
          🛕
        </div>
        <div>
          <div className="brand-title">
            Deity<span>Vision</span> AI
          </div>
          <div className="brand-subtitle">
            South Indian Iconography Engine
          </div>
        </div>
      </div>

      <nav className="nav-links">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="header-status">
        <span className="status-dot"></span>
        <span>{apiStatus ? 'Model Active' : 'Connecting...'}</span>
      </div>
    </header>
  );
}
