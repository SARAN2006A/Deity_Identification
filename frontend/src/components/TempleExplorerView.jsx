import React, { useState, useEffect } from 'react';
import { Search, MapPin, Landmark, Award, ArrowUpRight, Compass } from 'lucide-react';
import TempleModal from './TempleModal';

export default function TempleExplorerView({ defaultFilter = 'all', onSelectDeity }) {
  const [temples, setTemples] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/temples')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setTemples(data.temples);
        }
      })
      .catch((err) => console.error('Error fetching temples:', err))
      .finally(() => setLoading(false));
  }, []);

  const filterOptions = [
    { id: 'all', label: 'All Temples' },
    { id: 'shivan', label: 'Lord Shiva' },
    { id: 'murugan', label: 'Lord Murugan' },
    { id: 'perumal', label: 'Lord Perumal' },
    { id: 'amman', label: 'Goddess Amman' },
    { id: 'unesco', label: 'UNESCO World Heritage' },
  ];

  const filteredTemples = temples.filter((t) => {
    // Filter pill matching
    let matchesCategory = true;
    if (filter === 'unesco') {
      matchesCategory = t.unesco === true;
    } else if (filter !== 'all') {
      matchesCategory = t.deity.toLowerCase() === filter.toLowerCase();
    }

    // Search query matching
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.dynasty.toLowerCase().includes(q) ||
      t.deity_title.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fade-in">
      <div className="hero-banner" style={{ marginBottom: '1.8rem' }}>
        <div className="hero-pill">
          <Compass size={14} /> Dravidian Architectural Heritage
        </div>
        <h1 className="hero-title">
          South Indian Temple Explorer
        </h1>
        <p className="hero-desc">
          Explore the world's most monumental sacred Dravidian shrines, Chola granite monoliths, and ancient Pallava sanctuaries dedicated to South Indian deities.
        </p>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '480px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by temple name, city, or dynasty (e.g. Chola, Madurai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>

        <div className="temple-filter-bar">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              className={`filter-btn ${filter === opt.id ? 'active' : ''}`}
              onClick={() => setFilter(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Temple Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading temple directory...
        </div>
      ) : filteredTemples.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          No temples found matching your filter criteria.
        </div>
      ) : (
        <div className="temples-card-grid">
          {filteredTemples.map((temple) => (
            <div
              key={temple.id}
              className="glass-panel temple-card"
              onClick={() => setSelectedTemple(temple)}
              style={{ cursor: 'pointer' }}
            >
              <div className="temple-card-img-wrapper">
                <img
                  src={temple.image_url}
                  alt={temple.name}
                  className="temple-card-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/temples/thanjavur_brihadisvara.jpg';
                  }}
                />
                <div className="temple-badge-float">
                  <span className="badge badge-gold" style={{ textTransform: 'capitalize' }}>
                    {temple.deity}
                  </span>
                </div>
              </div>

              <div className="temple-card-body">
                <h3 className="temple-name">{temple.name}</h3>
                <div className="temple-location">
                  <MapPin size={14} color="var(--gold-400)" />
                  <span>{temple.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.8rem' }}>
                  <Landmark size={13} />
                  <span>{temple.dynasty}</span>
                </div>
                <p className="temple-highlights">
                  {temple.highlights}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--gold-400)', fontWeight: 600 }}>Explore Details</span>
                  <ArrowUpRight size={17} color="var(--gold-400)" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Temple Modal */}
      {selectedTemple && (
        <TempleModal
          temple={selectedTemple}
          onClose={() => setSelectedTemple(null)}
          onSelectDeity={onSelectDeity}
        />
      )}
    </div>
  );
}
