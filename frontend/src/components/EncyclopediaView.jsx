import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Shield, Compass, ChevronRight, Check } from 'lucide-react';

export default function EncyclopediaView({ activeDeity = 'shivan', onScanDeity, onExploreTemples }) {
  const [selectedDeity, setSelectedDeity] = useState(activeDeity);
  const [deityData, setDeityData] = useState(null);
  const [copiedMantra, setCopiedMantra] = useState(false);

  useEffect(() => {
    fetch('/api/deities')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setDeityData(data.metadata);
        }
      })
      .catch((err) => console.error('Error fetching deities:', err));
  }, []);

  const deitiesList = [
    { id: 'shivan', name: 'Lord Shiva', icon: '🔱', subtitle: 'Cosmic Transformer & Nataraja' },
    { id: 'murugan', name: 'Lord Murugan', icon: '🪶', subtitle: 'God of Wisdom & Commander' },
    { id: 'perumal', name: 'Lord Perumal', icon: '🐚', subtitle: 'Preserver of Cosmic Dharma' },
    { id: 'amman', name: 'Goddess Amman', icon: '🌺', subtitle: 'Divine Mother & Adi Shakti' },
  ];

  const currentInfo = deityData ? deityData[selectedDeity] : null;

  const copyMantra = (mantra) => {
    if (!mantra) return;
    navigator.clipboard.writeText(mantra);
    setCopiedMantra(true);
    setTimeout(() => setCopiedMantra(false), 2000);
  };

  return (
    <div className="fade-in">
      <div className="hero-banner" style={{ marginBottom: '2rem' }}>
        <div className="hero-pill">
          <BookOpen size={14} /> Sacred Hindu Shastras & Shilpa Shastra
        </div>
        <h1 className="hero-title">
          South Indian Iconography Guide
        </h1>
        <p className="hero-desc">
          Master the divine postures (Asanas), hand gestures (Mudras), weapons (Ayudhas), and symbolic mounts (Vahanas) that characterize South Indian temple sculpture.
        </p>
      </div>

      {/* Deity Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {deitiesList.map((d) => {
          const isSelected = selectedDeity === d.id;
          return (
            <div
              key={d.id}
              onClick={() => setSelectedDeity(d.id)}
              className="glass-panel"
              style={{
                padding: '1.2rem',
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--gold-400)' : 'var(--border-subtle)',
                background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
                boxShadow: isSelected ? '0 0 20px rgba(245, 158, 11, 0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ fontSize: '2rem' }}>{d.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: isSelected ? 'var(--gold-400)' : '#fff', fontSize: '1.05rem' }}>
                  {d.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {d.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Guide Content */}
      {currentInfo && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Mythology & Iconography attributes */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
              <div>
                <span className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>
                  {currentInfo.tamil_name}
                </span>
                <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.3rem' }}>
                  {currentInfo.title}
                </h2>
                <div style={{ color: 'var(--gold-400)', fontSize: '0.92rem', fontWeight: 600 }}>
                  {currentInfo.aspect}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-main)', fontSize: '0.98rem', lineHeight: '1.7', marginBottom: '1.8rem' }}>
              {currentInfo.description}
            </p>

            {/* Sacred Mantra Box */}
            {currentInfo.sacred_mantra && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.06)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '12px',
                padding: '1.2rem',
                marginBottom: '1.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-400)', fontWeight: 700 }}>
                    Sacred Moola Mantra
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#fff', marginTop: '0.2rem' }}>
                    "{currentInfo.sacred_mantra}"
                  </div>
                </div>
                <button
                  className="btn-outline"
                  onClick={() => copyMantra(currentInfo.sacred_mantra)}
                  style={{ whiteSpace: 'nowrap', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                >
                  {copiedMantra ? <Check size={14} color="#10b981" /> : null}
                  {copiedMantra ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}

            {/* Iconography Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--gold-400)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  ⚔️ Sacred Weapons (Ayudhas)
                </div>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {currentInfo.iconography?.weapons?.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700, marginBottom: '0.5rem' }}>
                  👑 Crown & Mount (Vahana)
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <strong style={{ color: '#fff' }}>Crown:</strong> {currentInfo.iconography?.crown_style}
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: '#fff' }}>Mount:</strong> {currentInfo.iconography?.vahana}
                </div>
              </div>
            </div>

            {/* Postures & Attributes */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#c084fc', fontWeight: 700, marginBottom: '0.5rem' }}>
                🧘 Classical Postures (Asanas) & Form
              </div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {currentInfo.iconography?.postures?.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: AI Model Features & Quick Exploration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* How AI spots it */}
            <div className="glass-panel" style={{ padding: '1.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Shield size={18} color="var(--gold-400)" />
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>
                  How DeityVision AI Identifies {selectedDeity.toUpperCase()}
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.2rem' }}>
                The ResNet50 neural network extracts specific spatial geometry and structural motifs to distinguish this class:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {currentInfo.key_features?.map((kf, i) => (
                  <div key={i} className="iconography-pill" style={{ background: 'rgba(255,255,255,0.025)' }}>
                    <span style={{ color: 'var(--gold-400)' }}>✔</span>
                    <span>{kf}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Temples to visit */}
            <div className="glass-panel" style={{ padding: '1.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Compass size={18} color="#38bdf8" />
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>
                  Major Shrines & Pilgrimages
                </h3>
              </div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '1.4rem' }}>
                {currentInfo.famous_temples?.map((tmpl, idx) => (
                  <li key={idx}>{tmpl}</li>
                ))}
              </ul>

              <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                <button
                  className="btn-gold"
                  onClick={() => onExploreTemples && onExploreTemples(selectedDeity)}
                >
                  <Compass size={16} /> Explore {selectedDeity.toUpperCase()} Temples
                </button>
                <button
                  className="btn-outline"
                  onClick={() => onScanDeity && onScanDeity()}
                >
                  <Sparkles size={16} /> Test Identification in Scanner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
