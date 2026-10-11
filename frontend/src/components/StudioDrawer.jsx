import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Landmark, Award, BookOpen, Clock, Activity, Bookmark, BookmarkCheck, Trash2, Check, Sparkles } from 'lucide-react';

export default function StudioDrawer({ activeDrawer, onClose, onSelectDeityForScan }) {
  const [temples, setTemples] = useState([]);
  const [templesLoading, setTemplesLoading] = useState(false);
  const [templesError, setTemplesError] = useState(null);
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [deities, setDeities] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  // Filters & local state
  const [templeSearch, setTempleSearch] = useState('');
  const [templeFilter, setTempleFilter] = useState('all');
  const [activeShastra, setActiveShastra] = useState('shivan');
  const [copiedMantra, setCopiedMantra] = useState(false);
  // Language toggle state (en = English, ta = Tamil)
  const [lang, setLang] = useState('en');

  useEffect(() => {
    if (!activeDrawer) return;

    if (activeDrawer === 'temples') {
      fetch('/api/temples')
        .then((res) => res.json())
        .then((data) => data.status === 'success' && setTemples(data.temples || []))
        .catch((err) => console.error(err));
    } else if (activeDrawer === 'shastras') {
      fetch('/api/deities')
        .then((res) => res.json())
        .then((data) => data.status === 'success' && setDeities(data.metadata || {}))
        .catch((err) => console.error(err));
    } else if (activeDrawer === 'history') {
      fetch('/api/history?limit=50')
        .then((res) => res.json())
        .then((data) => data.status === 'success' && setHistory(data.history || []))
        .catch((err) => console.error(err));
    } else if (activeDrawer === 'telemetry') {
      fetch('/api/stats')
        .then((res) => res.json())
        .then((data) => data.status === 'success' && setStats(data.stats || {}))
        .catch((err) => console.error(err));
    }
  }, [activeDrawer]);

  if (!activeDrawer) return null;

  const handleToggleTempleBookmark = async (templeId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/temples/${templeId}/bookmark`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setTemples((prev) =>
          prev.map((t) => (t.id === templeId ? { ...t, bookmarked: data.bookmarked } : t))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyMantraText = (mantra) => {
    if (!mantra) return;
    navigator.clipboard.writeText(mantra);
    setCopiedMantra(true);
    setTimeout(() => setCopiedMantra(false), 2000);
  };

  const titles = {
    temples: '🏛️ Sacred Temple Vault',
    shastras: '📜 Iconography & Shilpa Shastras',
    history: '⏱️ Scan History & Archives',
    telemetry: '📊 Neural Engine Telemetry',
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="studio-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-head">
          <h2 className="drawer-title">{titles[activeDrawer] || 'Studio Dossier'}</h2>
          <button className="drawer-close" onClick={onClose} title="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="drawer-body">
          {/* ================= 1. TEMPLE VAULT ================= */}
          {activeDrawer === 'temples' && (
            <div>
              <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search temple name, town, or dynasty..."
                    value={templeSearch}
                    onChange={(e) => setTempleSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem 0.7rem 2.5rem',
                      background: 'rgba(13, 38, 56, 0.75)',
                      border: '1px solid var(--border-gold-subtle)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {['all', 'shivan', 'murugan', 'perumal', 'amman', 'unesco'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTempleFilter(f)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: templeFilter === f ? 'var(--gold-400)' : 'var(--border-gold-subtle)',
                        background: templeFilter === f ? 'var(--gold-400)' : 'rgba(13, 38, 56, 0.65)',
                        color: templeFilter === f ? '#071A2B' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {temples
                  .filter((t) => {
                    let matchesFilter = true;
                    if (templeFilter === 'unesco') matchesFilter = t.unesco === true;
                    else if (templeFilter !== 'all') matchesFilter = t.deity.toLowerCase() === templeFilter.toLowerCase();
                    const q = templeSearch.toLowerCase();
                    const matchesSearch = t.name.toLowerCase().includes(q) || t.location.toLowerCase().includes(q) || t.dynasty.toLowerCase().includes(q);
                    return matchesFilter && matchesSearch;
                  })
                  .map((temple) => (
                                   <div
                  key={temple.id}
                  onClick={() => setSelectedTemple(temple)}
                  style={{
                    background: 'rgba(13, 38, 56, 0.80)',
                    border: '1px solid var(--border-gold-subtle)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                      <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                        <img
                          src={temple.image_url}
                          alt={temple.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            // Local deity temple fallbacks so images never show wrong external photos
                            const fallbacks = {
                              shivan:  '/temples/thanjavur_brihadisvara.jpg',
                              amman:   '/temples/madurai_meenakshi.jpg',
                              murugan: '/temples/palani_murugan.jpg',
                              perumal: '/temples/srirangam_ranganatha.jpg',
                            };
                            e.target.onerror = null; // prevent infinite loop
                            e.target.src = fallbacks[temple.deity] || '/temples/thanjavur_brihadisvara.jpg';
                          }}
                        />
                        {temple.unesco && (
                          <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem' }} className="badge-temple">
                            <Award size={12} /> UNESCO Heritage
                          </div>
                        )}
                        {/* Bookmark icon */}
                        <div
                          onClick={(e) => handleToggleTempleBookmark(temple.id, e)}
                          style={{
                            position: 'absolute',
                            top: '0.6rem',
                            left: '0.6rem',
                            cursor: 'pointer',
                            color: temple.bookmarked ? '#ffd700' : 'var(--text-muted)'
                          }}
                        >
                          {temple.bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </div>
                      </div>

                      <div style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                          <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{temple.name}</h3>
                          <span className="badge-temple" style={{ fontSize: '0.68rem' }}>{temple.deity}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gold-400)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                          <MapPin size={13} /> {temple.location} &bull; {temple.dynasty}
                        </div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '0.9rem' }}>
                          {temple.highlights}
                        </p>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-gold-subtle)', paddingTop: '0.6rem' }}>
                          <strong>Significance:</strong> {temple.significance}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ================= 2. ICONOGRAPHY SHASTRAS ================= */}
          {activeDrawer === 'shastras' && deities && (
            <div>
              {/* Language Switcher */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  onClick={() => setLang('en')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: lang === 'en' ? 'var(--gold-400)' : 'rgba(13, 38, 56, 0.70)',
                    color: lang === 'en' ? '#071A2B' : 'var(--text-primary)',
                    border: '1px solid',
                    borderColor: lang === 'en' ? 'var(--gold-400)' : 'var(--border-gold-subtle)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                  }}
                >
                  English
                </button>
                <button
                  onClick={() => setLang('ta')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: lang === 'ta' ? 'var(--gold-400)' : 'rgba(13, 38, 56, 0.70)',
                    color: lang === 'ta' ? '#071A2B' : 'var(--text-primary)',
                    border: '1px solid',
                    borderColor: lang === 'ta' ? 'var(--gold-400)' : 'var(--border-gold-subtle)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                  }}
                >
                  தமிழ்
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                  { id: 'shivan', label: 'Shiva', icon: '🔱' },
                  { id: 'murugan', label: 'Murugan', icon: '🪶' },
                  { id: 'perumal', label: 'Perumal', icon: '🐚' },
                  { id: 'amman', label: 'Amman', icon: '🌺' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setActiveShastra(d.id)}
                    style={{ padding: '0.6rem 0.4rem',
                      background: activeShastra === d.id ? 'var(--gold-400)' : 'rgba(13, 38, 56, 0.70)',
                      color: activeShastra === d.id ? '#071A2B' : 'var(--text-primary)',
                      border: '1px solid',
                      borderColor: activeShastra === d.id ? 'var(--gold-400)' : 'var(--border-gold-subtle)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      textAlign: 'center',
                    }}
                  >
                    <div>{d.icon}</div>
                    <div>{d.label}</div>
                  </button>
                ))}
              </div>

              {deities[activeShastra] && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ background: 'rgba(13, 38, 56, 0.80)', border: '1px solid var(--border-gold-medium)', borderRadius: '12px', padding: '1.3rem' }}>
                    <span className="badge-temple" style={{ marginBottom: '0.4rem' }}>
                      {lang === 'en' ? deities[activeShastra].title : (deities[activeShastra].tamil_name || deities[activeShastra].title)}
                    </span>
                    <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.3rem' }}>
                      {lang === 'en' ? deities[activeShastra].title : (deities[activeShastra].title_ta || deities[activeShastra].title)}
                    </h3>
                    <div style={{ color: 'var(--gold-300)', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.8rem' }}>
                      {lang === 'en' ? deities[activeShastra].aspect : (deities[activeShastra].aspect_ta || deities[activeShastra].aspect)}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                      {lang === 'en' ? deities[activeShastra].description : (deities[activeShastra].description_ta || deities[activeShastra].description)}
                    </p>
                  </div>

                  {/* Sacred Mantra */}
                  {deities[activeShastra].sacred_mantra && (
                    <div className="mantra-sanctum">
                      <div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--gold-400)', fontWeight: 700, letterSpacing: '0.1em' }}>
                          {lang === 'en' ? 'Moola Mantra' : 'மூல மந்திரம்'}
                        </div>
                        <div className="mantra-text">"{deities[activeShastra].sacred_mantra}"</div>
                      </div>
                      <button
                        className="btn-obsidian-outline"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                        onClick={() => copyMantraText(deities[activeShastra].sacred_mantra)}
                      >
                        {copiedMantra ? <Check size={14} color="#10b981" /> : null}
                        {copiedMantra ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}

                  {/* Iconography Attributes */}
                  <div style={{ background: 'rgba(13, 38, 56, 0.75)', border: '1px solid var(--border-gold-subtle)', borderRadius: '12px', padding: '1.2rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                                            {lang === 'en' ? '⚔️ Sacred Weapons & Attributes' : '⚔️ திருவுருவ ஆயுதங்கள் & பண்புகள்'}
                    </div>
                    <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.6' }}>
                      {(lang === 'en'
                        ? deities[activeShastra].iconography?.weapons
                        : (deities[activeShastra].iconography?.weapons_ta || deities[activeShastra].iconography?.weapons)
                      )?.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>

                    <div style={{ marginTop: '0.9rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <strong>{lang === 'en' ? 'Crown Style:' : 'முகுட நடை:'}</strong>{' '}
                      {lang === 'en'
                        ? deities[activeShastra].iconography?.crown_style
                        : (deities[activeShastra].iconography?.crown_style_ta || deities[activeShastra].iconography?.crown_style)}
                    </div>
                    <div style={{ marginTop: '0.3rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <strong>{lang === 'en' ? 'Sacred Mount (Vahana):' : 'திருவாகனம் (வாஹனம்):'}</strong>{' '}
                      {lang === 'en'
                        ? deities[activeShastra].iconography?.vahana
                        : (deities[activeShastra].iconography?.vahana_ta || deities[activeShastra].iconography?.vahana)}
                    </div>
                  </div>

                  {/* How AI spots it */}
                  <div style={{ background: 'rgba(13, 38, 56, 0.75)', border: '1px solid var(--border-gold-subtle)', borderRadius: '12px', padding: '1.2rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                      🎯 {lang === 'en' ? 'Iconographic Identifying Features' : 'திருவுருவ அடையாளங்கள்'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {(lang === 'en'
                        ? deities[activeShastra].key_features
                        : (deities[activeShastra].key_features_ta || deities[activeShastra].key_features)
                      )?.map((f, i) => (
                        <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--gold-400)' }}>✦</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 3. SCAN HISTORY ================= */}
          {activeDrawer === 'history' && (
            <div>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>📭</div>
                  <h4 style={{ color: '#fff', marginBottom: '0.3rem' }}>No Scan Records Found</h4>
                  <p style={{ fontSize: '0.85rem' }}>Perform an idol scan in the main studio to populate the archive.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {history.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: 'rgba(13, 38, 56, 0.80)',
                        border: '1px solid var(--border-gold-subtle)',
                        borderRadius: '10px',
                        padding: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.9rem',
                      }}
                    >
                      {item.image_b64 ? (
                        <img
                          src={item.image_b64}
                          alt={item.best_guess}
                          style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-gold-subtle)' }}
                        />
                      ) : (
                        <div style={{ width: '56px', height: '56px', background: '#000', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          🛕
                        </div>
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gold-300)', textTransform: 'capitalize' }}>
                            {item.best_guess}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                            {item.confidence}%
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {item.timestamp ? new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={(e) => handleToggleBookmark(item.id, e)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: item.bookmarked ? '#10b981' : 'var(--text-muted)', padding: '0.3rem' }}
                        >
                          {item.bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>
                        <button
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fb7185', padding: '0.3rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 4. TELEMETRY ================= */}
          {activeDrawer === 'telemetry' && stats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.9rem' }}>
                <div style={{ background: 'rgba(13, 38, 56, 0.80)', border: '1px solid var(--border-gold-subtle)', borderRadius: '10px', padding: '1.1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {stats.total_scans || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Total Inferences
                  </div>
                </div>

                <div style={{ background: 'rgba(13, 38, 56, 0.80)', border: '1px solid var(--border-gold-subtle)', borderRadius: '10px', padding: '1.1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-300)', fontFamily: 'var(--font-mono)' }}>
                    {stats.avg_confidence || 0}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Average Confidence
                  </div>
                </div>
              </div>

              {/* Class Distribution */}
              <div style={{ background: 'rgba(13, 38, 56, 0.80)', border: '1px solid var(--border-gold-subtle)', borderRadius: '12px', padding: '1.3rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', marginBottom: '0.9rem' }}>
                  Class Breakdown In SQLite
                </div>
                {stats.distribution?.map((item) => (
                  <div key={item.deity} style={{ marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{item.deity}</span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {item.count} scans &bull; {item.avg_confidence}%
                      </span>
                    </div>
                    <div className="matrix-track" style={{ height: '6px' }}>
                      <div
                        className="matrix-bar-fill fill-gold"
                        style={{ width: `${stats.total_scans > 0 ? (item.count / stats.total_scans) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Model Specifications */}
              <div style={{ background: 'rgba(13, 38, 56, 0.80)', border: '1px solid var(--border-gold-subtle)', borderRadius: '12px', padding: '1.3rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                  Neural Architecture Specs
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div><strong>Backbone:</strong> Deep Residual Network 50 (ResNet-50)</div>
                  <div><strong>Embeddings:</strong> 2048-dim global average pooling</div>
                  <div><strong>Loss Objective:</strong> Cross-Entropy with inverse-frequency weighting</div>
                  <div><strong>Hardware Device:</strong> PyTorch CPU Acceleration</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
