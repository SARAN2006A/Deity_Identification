import React from 'react';
import { X, MapPin, Landmark, Award, Sparkles, ExternalLink } from 'lucide-react';

export default function TempleModal({ temple, onClose, onSelectDeity }) {
  if (!temple) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div style={{ borderRadius: '12px', overflow: 'hidden', height: '260px', marginBottom: '1.4rem', position: 'relative' }}>
          <img
            src={temple.image_url}
            alt={temple.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/temples/thanjavur_brihadisvara.jpg';
            }}
          />
          {temple.unesco && (
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }} className="badge badge-gold">
              <Award size={13} /> UNESCO World Heritage Site
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
            {temple.deity_title}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{temple.tamil_name}</span>
        </div>

        <h2 style={{ fontSize: '1.7rem', color: '#fff', marginBottom: '0.6rem' }}>
          {temple.name}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} color="var(--gold-400)" /> {temple.location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Landmark size={16} color="var(--gold-400)" /> {temple.dynasty}
          </span>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            Architectural Marvels & Features
          </div>
          <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: '1.6' }}>
            {temple.highlights}
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            Spiritual & Iconographic Significance
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            {temple.significance}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
          <button
            className="btn-gold"
            onClick={() => {
              onClose();
              if (onSelectDeity) onSelectDeity(temple.deity);
            }}
          >
            <Sparkles size={16} /> View {temple.deity.toUpperCase()} Iconography
          </button>
        </div>
      </div>
    </div>
  );
}
