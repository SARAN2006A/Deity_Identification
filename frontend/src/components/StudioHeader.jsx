import React from 'react';
import { Landmark, BookOpen, Clock, Activity, Sparkles } from 'lucide-react';

export default function StudioHeader({ onOpenDrawer, activeDrawer, apiStatus }) {
  return (
    <header className="studio-header">
      <div className="studio-brand" onClick={() => onOpenDrawer(null)}>
        <div className="studio-emblem">
          🛕
        </div>
        <div className="studio-title-group">
          <h1 className="serif-heading">DEITY<span>VISION</span></h1>
          <div className="studio-subtitle">SACRED ICONOGRAPHY & TEMPLE STUDIO</div>
        </div>
      </div>

      <div className="studio-nav-pills">
        <button
          className={`studio-nav-btn ${activeDrawer === 'temples' ? 'active' : ''}`}
          onClick={() => onOpenDrawer(activeDrawer === 'temples' ? null : 'temples')}
        >
          <Landmark size={16} />
          <span>Temple Vault</span>
        </button>

        <button
          className={`studio-nav-btn ${activeDrawer === 'shastras' ? 'active' : ''}`}
          onClick={() => onOpenDrawer(activeDrawer === 'shastras' ? null : 'shastras')}
        >
          <BookOpen size={16} />
          <span>Iconography Shastras</span>
        </button>

        <button
          className={`studio-nav-btn ${activeDrawer === 'history' ? 'active' : ''}`}
          onClick={() => onOpenDrawer(activeDrawer === 'history' ? null : 'history')}
        >
          <Clock size={16} />
          <span>Scan Vault</span>
        </button>

        <button
          className={`studio-nav-btn ${activeDrawer === 'telemetry' ? 'active' : ''}`}
          onClick={() => onOpenDrawer(activeDrawer === 'telemetry' ? null : 'telemetry')}
        >
          <Activity size={16} />
          <span>Telemetry</span>
        </button>
      </div>

      <div className="studio-telemetry">
        <span className="gem-pulse"></span>
        <span>{apiStatus ? 'ResNet-50 Active' : 'Connecting Engine...'}</span>
      </div>
    </header>
  );
}
