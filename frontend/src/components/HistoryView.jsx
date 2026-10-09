import React, { useState, useEffect } from 'react';
import { Clock, Bookmark, BookmarkCheck, Trash2, Eye, Filter, RefreshCw } from 'lucide-react';

export default function HistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deityFilter, setDeityFilter] = useState('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchHistory = () => {
    setLoading(true);
    let url = `/api/history?limit=60`;
    if (deityFilter) url += `&deity=${deityFilter}`;
    if (bookmarkedOnly) url += `&bookmarked=true`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setHistory(data.history || []);
        }
      })
      .catch((err) => console.error('Error fetching history:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [deityFilter, bookmarkedOnly]);

  const handleToggleBookmark = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/history/${id}/bookmark`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setHistory((prev) =>
          prev.map((item) => (item.id === id ? { ...item, bookmarked: data.bookmarked } : item))
        );
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleDeleteScan = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this scan entry?')) return;
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        if (selectedScan && selectedScan.id === id) {
          setSelectedScan(null);
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fade-in">
      <div className="hero-banner" style={{ marginBottom: '1.8rem' }}>
        <div className="hero-pill">
          <Clock size={14} /> SQLite Persistence Storage
        </div>
        <h1 className="hero-title">Scan History & Archive</h1>
        <p className="hero-desc">
          Review past neural network inferences, bookmarked deity recognitions, and audit confidence breakdowns.
        </p>
      </div>

      {/* Filter and Action Controls */}
      <div className="history-controls">
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {['', 'shivan', 'murugan', 'perumal', 'amman'].map((d) => (
            <button
              key={d}
              className={`filter-btn ${deityFilter === d ? 'active' : ''}`}
              onClick={() => setDeityFilter(d)}
            >
              {d === '' ? 'All Scans' : d.toUpperCase()}
            </button>
          ))}
          <button
            className={`filter-btn ${bookmarkedOnly ? 'active' : ''}`}
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
          >
            ★ Bookmarked Only
          </button>
        </div>

        <button className="btn-outline" onClick={fetchHistory} title="Refresh History">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Grid of Past Scans */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
          Loading scan records...
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>📭</div>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.4rem' }}>No Scans Found</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Run an inference in the AI Scanner to start populating your SQLite history database.
          </p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div
              key={item.id}
              className="glass-panel history-card"
              onClick={() => setSelectedScan(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className="history-card-top">
                {item.image_b64 ? (
                  <img src={item.image_b64} alt={item.best_guess} className="history-thumb" />
                ) : (
                  <div className="history-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🛕
                  </div>
                )}
                <div className="history-meta">
                  <div className="history-deity">{item.best_guess}</div>
                  <div className="history-time">{formatDate(item.timestamp)}</div>
                  <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, marginTop: '2px' }}>
                    {item.confidence}% Match
                  </div>
                </div>
              </div>

              {/* Progress bar preview */}
              <div className="breakdown-track">
                <div
                  className={`breakdown-fill fill-${item.best_guess.toLowerCase()}`}
                  style={{ width: `${item.confidence}%` }}
                ></div>
              </div>

              <div className="history-actions">
                <button
                  className="btn-outline"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={(e) => handleToggleBookmark(item.id, e)}
                  title="Toggle Bookmark"
                >
                  {item.bookmarked ? <BookmarkCheck size={14} color="#10b981" /> : <Bookmark size={14} />}
                </button>
                <button
                  className="btn-outline"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#fb7185' }}
                  onClick={(e) => handleDeleteScan(item.id, e)}
                  title="Delete Record"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Scan Inspect Modal */}
      {selectedScan && (
        <div className="modal-overlay" onClick={() => setSelectedScan(null)}>
          <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--gold-400)' }}>
                Scan #{selectedScan.id} — {selectedScan.best_guess.toUpperCase()}
              </h3>
              <button className="modal-close-btn" onClick={() => setSelectedScan(null)}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {selectedScan.image_b64 && (
                <img
                  src={selectedScan.image_b64}
                  alt={selectedScan.best_guess}
                  style={{ width: '130px', height: '130px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}
                />
              )}
              <div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Recorded: {formatDate(selectedScan.timestamp)}
                </div>
                <div style={{ fontSize: '1.6rem', color: '#34d399', fontWeight: 800 }}>
                  {selectedScan.confidence}% Confidence
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  File: {selectedScan.filename || 'Direct Upload'}
                </div>
              </div>
            </div>

            {/* Confidence breakdown */}
            <div className="breakdown-box" style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Prediction Probabilities
              </div>
              {selectedScan.predictions?.map((pred) => (
                <div key={pred.class} className="breakdown-item">
                  <div className="breakdown-labels">
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{pred.class}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{pred.confidence}%</span>
                  </div>
                  <div className="breakdown-track">
                    <div
                      className={`breakdown-fill fill-${pred.class}`}
                      style={{ width: `${pred.confidence}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button className="btn-outline" onClick={() => setSelectedScan(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
