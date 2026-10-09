import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoldParticleCanvas from './GoldParticleCanvas';
import {
  Sparkles,
  Camera,
  Landmark,
  BookOpen,
  History,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';

export default function LandingPage({ onOpenDrawer }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleExploreScanner = () => {
    if (isAuthenticated) {
      navigate('/scanner');
    } else {
      navigate('/login?redirect=/scanner');
    }
  };

  const handleOpenDrawerClick = (drawerName) => {
    navigate('/scanner');
    if (onOpenDrawer) {
      setTimeout(() => onOpenDrawer(drawerName), 200);
    }
  };

  return (
    <div className="landing-page-wrapper">
      {/* ================= HERO SECTION ================= */}
      <section className="hero-section">
        <GoldParticleCanvas />

        <div className="hero-content-container">
          {/* Left Column: Text & CTAs */}
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
              <button className="btn-gold-royal hero-btn-main" onClick={handleExploreScanner}>
                <Camera size={18} /> Explore AI Scanner
              </button>
              <a href="#heritage" className="btn-obsidian-outline hero-btn-sec">
                <Landmark size={18} /> Discover Temple Heritage
              </a>
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
          </div>

          {/* Right Column: Hero Visual with Halo Glow & Floating Sculpture */}
          <div className="hero-visual-block fade-in">
            <div className="sculpture-halo-container">
              <div className="golden-halo-ring halo-ring-1"></div>
              <div className="golden-halo-ring halo-ring-2"></div>

              {/* Cinematic Sculpture Illustration / Graphic */}
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

      {/* ================= FEATURES SECTION ================= */}
      <section className="features-section" id="features">
        <div className="section-header text-center">
          <div className="heritage-ornament">SHILPA SHASTRA ENGINE</div>
          <h2 className="section-title serif-heading">
            Full-Stack <span>Heritage Capabilities</span>
          </h2>
          <p className="section-subtitle">
            Combines deep learning visual representation with classical South Indian temple iconography documentation.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card" onClick={handleExploreScanner}>
            <div className="feature-icon-pod">
              <Cpu size={26} color="var(--gold-300)" />
            </div>
            <h3 className="feature-card-title serif-heading">AI Deity Recognition</h3>
            <p className="feature-card-desc">
              Upload a sculpture image and receive a prediction from the trained AI model with 2048-dimensional vector analysis.
            </p>
            <div className="feature-card-link">
              <span>Launch Scanner</span> <ArrowRight size={15} />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="feature-card" onClick={() => handleOpenDrawerClick('temples')}>
            <div className="feature-icon-pod">
              <Landmark size={26} color="var(--gold-300)" />
            </div>
            <h3 className="feature-card-title serif-heading">Temple Vault</h3>
            <p className="feature-card-desc">
              Explore temples associated with recognised deity classes, with relevant historical and architectural information.
            </p>
            <div className="feature-card-link">
              <span>Explore Temples</span> <ArrowRight size={15} />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="feature-card" onClick={() => handleOpenDrawerClick('shastras')}>
            <div className="feature-icon-pod">
              <BookOpen size={26} color="var(--gold-300)" />
            </div>
            <h3 className="feature-card-title serif-heading">Iconography & Shilpa Shastras</h3>
            <p className="feature-card-desc">
              Learn about deity symbols, weapons, ornaments, postures and traditional iconography in English and Tamil.
            </p>
            <div className="feature-card-link">
              <span>View Shastras</span> <ArrowRight size={15} />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="feature-card" onClick={() => handleOpenDrawerClick('history')}>
            <div className="feature-icon-pod">
              <History size={26} color="var(--gold-300)" />
            </div>
            <h3 className="feature-card-title serif-heading">Scan Vault & Analytics</h3>
            <p className="feature-card-desc">
              Access saved scan history, bookmarks and available prediction statistics with personal user isolation.
            </p>
            <div className="feature-card-link">
              <span>View Analytics</span> <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <section className="how-it-works-section">
        <div className="section-header text-center">
          <div className="heritage-ornament">SIMPLE THREE-STEP WORKFLOW</div>
          <h2 className="section-title serif-heading">
            How <span>DeityVision AI</span> Works
          </h2>
        </div>

        <div className="timeline-container">
          <div className="timeline-step">
            <div className="step-number-badge">01</div>
            <div className="step-content-box">
              <h4 className="step-title serif-heading">Upload Sculpture Image</h4>
              <p className="step-desc">
                Select or capture an image of any South Indian stone, bronze, or stucco deity idol.
              </p>
            </div>
          </div>

          <div className="timeline-connector"></div>

          <div className="timeline-step">
            <div className="step-number-badge">02</div>
            <div className="step-content-box">
              <h4 className="step-title serif-heading">AI Model Analysis</h4>
              <p className="step-desc">
                Our PyTorch ResNet-50 neural engine evaluates image quality and extracts visual iconography attributes.
              </p>
            </div>
          </div>

          <div className="timeline-connector"></div>

          <div className="timeline-step">
            <div className="step-number-badge">03</div>
            <div className="step-content-box">
              <h4 className="step-title serif-heading">Explore Cultural Knowledge</h4>
              <p className="step-desc">
                Inspect Grad-CAM heatmaps, sacred mudras, moola mantras, and matching temple heritage vault dossiers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SUPPORTED DEITIES SECTION ================= */}
      <section className="deities-section">
        <div className="section-header text-center">
          <div className="heritage-ornament">AI CLASSIFICATION COVERAGE</div>
          <h2 className="section-title serif-heading">
            Supported <span>Deity Classes</span>
          </h2>
          <p className="section-subtitle">
            Fine-tuned on authentic South Indian temple sculpture datasets across four principal iconography classes.
          </p>
        </div>

        <div className="deities-grid">
          {/* Card 1: Lord Shiva */}
          <div className="deity-class-card" onClick={handleExploreScanner}>
            <div className="deity-card-header">
              <span className="deity-symbol-icon">🔱</span>
              <div className="deity-bilingual">
                <h3 className="deity-en-title serif-heading">Lord Shiva</h3>
                <div className="deity-ta-title tamil-text">சிவபெருமான்</div>
              </div>
            </div>
            <p className="deity-card-summary">
              Supreme Cosmic Transformer, Lord of Nataraja cosmic dance, revered as Aniconic Shiva Lingam.
            </p>
            <div className="deity-tag-pill">Nataraja &bull; Trishula &bull; Peetam</div>
          </div>

          {/* Card 2: Lord Murugan */}
          <div className="deity-class-card" onClick={handleExploreScanner}>
            <div className="deity-card-header">
              <span className="deity-symbol-icon">🪶</span>
              <div className="deity-bilingual">
                <h3 className="deity-en-title serif-heading">Lord Murugan</h3>
                <div className="deity-ta-title tamil-text">முருகப்பெருமான்</div>
              </div>
            </div>
            <p className="deity-card-summary">
              Divine Commander of Cosmic Forces, guardian of Tamil language, holding sacred Vel spear and Mayil mount.
            </p>
            <div className="deity-tag-pill">Vel &bull; Peacock Mount &bull; Six Abodes</div>
          </div>

          {/* Card 3: Lord Perumal */}
          <div className="deity-class-card" onClick={handleExploreScanner}>
            <div className="deity-card-header">
              <span className="deity-symbol-icon">🐚</span>
              <div className="deity-bilingual">
                <h3 className="deity-en-title serif-heading">Lord Perumal</h3>
                <div className="deity-ta-title tamil-text">பெருமாள் / விஷ்ணு</div>
              </div>
            </div>
            <p className="deity-card-summary">
              Preserver of Cosmic Order, adorned with Shankha (Conch), Sudarshana Chakra, and Garuda mount.
            </p>
            <div className="deity-tag-pill">Shankha &bull; Chakra &bull; Srirangam</div>
          </div>

          {/* Card 4: Goddess Amman */}
          <div className="deity-class-card" onClick={handleExploreScanner}>
            <div className="deity-card-header">
              <span className="deity-symbol-icon">🌺</span>
              <div className="deity-bilingual">
                <h3 className="deity-en-title serif-heading">Goddess Amman</h3>
                <div className="deity-ta-title tamil-text">அம்மன் / சக்தி</div>
              </div>
            </div>
            <p className="deity-card-summary">
              Divine Mother & Sacred Feminine Power, holding Trishula, Kumkum, lotus blossoms, and Simha mount.
            </p>
            <div className="deity-tag-pill">Shakti &bull; Lotus &bull; Madurai Meenakshi</div>
          </div>
        </div>
      </section>

      {/* ================= HERITAGE SHOWCASE SECTION ================= */}
      <section className="heritage-section" id="heritage">
        <div className="section-header text-center">
          <div className="heritage-ornament">ARCHITECTURAL MAP</div>
          <h2 className="section-title serif-heading">
            Temple <span>Heritage Vault</span>
          </h2>
          <p className="section-subtitle">
            Authentic historical and architectural intelligence for major South Indian temple sanctuaries.
          </p>
        </div>

        <div className="temple-showcase-grid">
          {/* Temple 1 */}
          <div className="temple-showcase-card">
            <div className="temple-card-badge">UNESCO World Heritage</div>
            <h3 className="temple-card-title serif-heading">Brihadisvara Temple</h3>
            <div className="temple-card-location">Thanjavur, Tamil Nadu</div>
            <p className="temple-card-text">
              Built by Great Chola King Raja Raja I (1010 CE). Renowned for its 216 ft granite vimana tower and monolithic Nandi mandapam.
            </p>
            <div className="temple-card-meta">
              <span>Primary Deity: Lord Shiva (Peruvudaiyar)</span>
            </div>
          </div>

          {/* Temple 2 */}
          <div className="temple-showcase-card">
            <div className="temple-card-badge">Dravidian Architectural Wonder</div>
            <h3 className="temple-card-title serif-heading">Meenakshi Amman Temple</h3>
            <div className="temple-card-location">Madurai, Tamil Nadu</div>
            <p className="temple-card-text">
              Historic sanctuary featuring 14 magnificent gopuram towers decorated with thousands of stone and stucco divine sculptures.
            </p>
            <div className="temple-card-meta">
              <span>Primary Deity: Goddess Meenakshi Amman</span>
            </div>
          </div>

          {/* Temple 3 */}
          <div className="temple-showcase-card">
            <div className="temple-card-badge">Sacred Hill Sanctuary</div>
            <h3 className="temple-card-title serif-heading">Palani Murugan Temple</h3>
            <div className="temple-card-location">Palani, Tamil Nadu</div>
            <p className="temple-card-text">
              One of the Arupadaiveedu (Six Abodes of Lord Murugan). The idol is consecrated with sacred Navapashanam by Sage Bogar.
            </p>
            <div className="temple-card-meta">
              <span>Primary Deity: Dhandayuthapani Swamy</span>
            </div>
          </div>

          {/* Temple 4 */}
          <div className="temple-showcase-card">
            <div className="temple-card-badge">World's Largest Functioning Complex</div>
            <h3 className="temple-card-title serif-heading">Srirangam Ranganathaswamy</h3>
            <div className="temple-card-location">Tiruchirappalli, Tamil Nadu</div>
            <p className="temple-card-text">
              Spanning 156 acres with 21 grand gopurams and 7 concentric prakara enclosures dedicated to Lord Ranganatha (Perumal).
            </p>
            <div className="temple-card-meta">
              <span>Primary Deity: Lord Ranganatha / Vishnu</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="final-cta-section">
        <div className="final-cta-card text-center">
          <div className="heritage-ornament">START EXPLORING TODAY</div>
          <h2 className="final-cta-heading serif-heading">
            Begin Your Journey into <span>Temple Heritage</span>
          </h2>
          <p className="final-cta-desc">
            Discover the stories, symbols and sculptural traditions behind South India's sacred heritage with deep learning intelligence.
          </p>
          <button className="btn-gold-royal btn-large-cta" onClick={handleExploreScanner}>
            <Sparkles size={18} /> Get Started Now
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="landing-footer" id="about">
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
              Full-stack AI platform combining computer vision deep learning with authentic South Indian Hindu temple iconography and architectural research.
            </p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title serif-heading">Navigation</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/scanner">AI Scanner</Link></li>
              <li><Link to="/login">Account Login</Link></li>
              <li><Link to="/signup">Register Account</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title serif-heading">Tech Overview</h4>
            <ul>
              <li>PyTorch & ResNet-50 Transfer Learning</li>
              <li>Explainable AI Grad-CAM Saliency</li>
              <li>Flask REST API & SQLite Session Storage</li>
              <li>React 18 & Vite Production UI</li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title serif-heading">Academic & Research</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Designed for research, educational exploration, and preservation of South Indian temple sculptural heritage under Shilpa Shastra tradition.
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
