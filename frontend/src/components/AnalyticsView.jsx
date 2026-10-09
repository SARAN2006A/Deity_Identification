import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Target, Bookmark, Cpu, Layers, CheckCircle2 } from 'lucide-react';

export default function AnalyticsView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      <div className="hero-banner" style={{ marginBottom: '2rem' }}>
        <div className="hero-pill">
          <BarChart3 size={14} /> Telemetry & Model Benchmark
        </div>
        <h1 className="hero-title">Model Analytics & System Insights</h1>
        <p className="hero-desc">
          Monitor real-time classification metrics, sample distributions, and transfer learning architecture specifications.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading system telemetry...
        </div>
      ) : (
        <>
          {/* Key Metrics Widgets */}
          <div className="stats-grid">
            <div className="glass-panel stat-widget">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--gold-400)' }}>
                <Activity size={26} />
              </div>
              <div>
                <div className="stat-val">{stats?.total_scans || 0}</div>
                <div className="stat-label">Total Predictions</div>
              </div>
            </div>

            <div className="glass-panel stat-widget">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Target size={26} />
              </div>
              <div>
                <div className="stat-val">{stats?.avg_confidence || 0}%</div>
                <div className="stat-label">Average Confidence</div>
              </div>
            </div>

            <div className="glass-panel stat-widget">
              <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                <Bookmark size={26} />
              </div>
              <div>
                <div className="stat-val">{stats?.bookmarked_count || 0}</div>
                <div className="stat-label">Bookmarked Scans</div>
              </div>
            </div>

            <div className="glass-panel stat-widget">
              <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
                <CheckCircle2 size={26} />
              </div>
              <div>
                <div className="stat-val" style={{ textTransform: 'capitalize' }}>
                  {stats?.most_scanned || 'N/A'}
                </div>
                <div className="stat-label">Top Identified Deity</div>
              </div>
            </div>
          </div>

          {/* Model Architecture & Class Distribution Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            {/* Distribution */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <Layers size={20} color="var(--gold-400)" />
                <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Historical Identification Breakdown</h3>
              </div>

              {stats?.distribution && stats.distribution.length > 0 ? (
                <div>
                  {stats.distribution.map((item) => {
                    const percent = stats.total_scans > 0 ? Math.round((item.count / stats.total_scans) * 100) : 0;
                    return (
                      <div key={item.deity} style={{ marginBottom: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item.deity}</span>
                          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {item.count} scans ({percent}%) &bull; Avg Conf: {item.avg_confidence}%
                          </span>
                        </div>
                        <div className="breakdown-track" style={{ height: '10px' }}>
                          <div
                            className={`breakdown-fill fill-${item.deity.toLowerCase()}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '2rem 0', textAlign: 'center' }}>
                  No historical records yet. Scans run in the AI Scanner will dynamically reflect here.
                </div>
              )}
            </div>

            {/* Neural Architecture Card */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.4rem' }}>
                <Cpu size={20} color="#38bdf8" />
                <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Neural Backbone Architecture</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Backbone Architecture</span>
                  <span style={{ fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)' }}>PyTorch ResNet-50</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Input Preprocessing</span>
                  <span style={{ fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)' }}>Resize 256 + CenterCrop 224</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Classification Head</span>
                  <span style={{ fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)' }}>Dropout(0.5) + Linear(2048, 4)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Class Balancing</span>
                  <span style={{ fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)' }}>Inverse-Frequency Loss</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Persistence Engine</span>
                  <span style={{ fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)' }}>SQLite Database (scan_history)</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
