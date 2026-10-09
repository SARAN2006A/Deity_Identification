import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Download,
  Check,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Award,
  Eye,
  Sliders
} from 'lucide-react';

export default function StudioMainStage({ onOpenTempleDossier }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [copiedMantra, setCopiedMantra] = useState(false);

  // Feature state additions
  const [qualityCheck, setQualityCheck] = useState(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [qualityWarningPending, setQualityWarningPending] = useState(false);
  const [gradcamView, setGradcamView] = useState('overlay'); // 'overlay' | 'original' | 'heatmap' | 'split'
  const [samples, setSamples] = useState([]);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Load sample gallery for quick 1-click interactive testing
  useEffect(() => {
    fetch('/api/samples')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && data.samples) {
          setSamples(data.samples);
        }
      })
      .catch((err) => console.log('Samples loaded locally:', err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = async (file) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setResult(null);
    setError(null);
    setIsBookmarked(false);
    setIsCheckingQuality(true);
    setQualityWarningPending(false);

    // Feature 2: Image Quality Check before prediction
    const formData = new FormData();
    formData.append('file', file);

    try {
      const qRes = await fetch('/api/quality_check', {
        method: 'POST',
        body: formData,
      });
      const qData = await qRes.json();
      setIsCheckingQuality(false);

      if (qData.status === 'success' && qData.quality) {
        setQualityCheck(qData.quality);
        if (qData.quality.is_good) {
          // If image quality is GOOD, proceed directly to inference
          runInference(file);
        } else {
          // If image quality is POOR: display clear warning & allow user to proceed if appropriate
          setQualityWarningPending(true);
        }
      } else {
        // Fallback: proceed to prediction
        runInference(file);
      }
    } catch (err) {
      console.warn('Quality pre-check non-blocking exception:', err);
      setIsCheckingQuality(false);
      runInference(file);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const runInference = async (file) => {
    setIsScanning(true);
    setError(null);
    setQualityWarningPending(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Neural inference failed');
      }

      const data = await response.json();
      setResult(data);
      if (data.quality_check) {
        setQualityCheck(data.quality_check);
      }
    } catch (err) {
      setError(err.message || 'Error occurred during deity recognition');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectSample = async (sample) => {
    try {
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: blob.type || 'image/jpeg' });
      processFile(file);
    } catch (err) {
      console.error('Failed to load sample:', err);
    }
  };

  const startWebcam = async () => {
    try {
      setIsWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Unable to access camera: ' + err.message);
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  const captureWebcam = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    stopWebcam();

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'webcam_capture.jpg', { type: 'image/jpeg' });
        processFile(file);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleBookmarkToggle = async () => {
    if (!result || !result.scan_id) return;
    try {
      const res = await fetch(`/api/history/${result.scan_id}/bookmark`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setIsBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportJSON = () => {
    if (!result) return;
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deity_prediction_${result.best_guess}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setIsBookmarked(false);
    setQualityCheck(null);
    setIsCheckingQuality(false);
    setQualityWarningPending(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyMantra = (mantra) => {
    if (!mantra) return;
    navigator.clipboard.writeText(mantra);
    setCopiedMantra(true);
    setTimeout(() => setCopiedMantra(false), 2000);
  };

  return (
    <div className="fade-in">
      {/* Heritage Studio Banner */}
      <div className="studio-intro">
        <div className="heritage-ornament">
          <span>Sacred Shilpa Shastra & Deep Learning</span>
        </div>
        <h2 className="studio-headline">
          South Indian <span>Temple Deity Studio</span>
        </h2>
        <p className="studio-desc">
          Identify ancient granite carvings, bronze utsava murtis, and sacred temple iconography. Powered by fine-tuned ResNet-50 neural feature maps trained across four canonical divine traditions.
        </p>
      </div>

      {/* Main Studio Deck */}
      <div className="studio-deck">
        {/* ================= LEFT: SCANNER FRAME ================= */}
        <div className="temple-frame-card">
          <div className="corner-ornament corner-tl"></div>
          <div className="corner-ornament corner-tr"></div>
          <div className="corner-ornament corner-bl"></div>
          <div className="corner-ornament corner-br"></div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {isWebcamActive ? (
            <div style={{ textAlign: 'center' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '360px', borderRadius: '12px', background: '#000', border: '1px solid var(--border-gold-medium)' }}
              />
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.2rem' }}>
                <button className="btn-gold-royal" onClick={captureWebcam}>
                  <Camera size={18} /> Capture Idol
                </button>
                <button className="btn-obsidian-outline" onClick={stopWebcam}>
                  Cancel
                </button>
              </div>
            </div>
          ) : previewUrl ? (
            <div>
              <div className="scanner-viewport">
                <img src={previewUrl} alt="Sculpture Preview" className="scanner-img" />
                {(isScanning || isCheckingQuality) && <div className="gold-laser-reticle"></div>}
              </div>

              {/* Feature 2: Pre-Inference Quality Audit Alert (if poor or checking) */}
              {isCheckingQuality && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(13, 38, 56, 0.70)',
                  border: '1px solid var(--border-gold-subtle)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.84rem',
                  color: 'var(--gold-300)'
                }}>
                  <Sparkles size={16} className="gem-pulse" />
                  <span>Auditing sculpture image quality (resolution, focus & lighting)...</span>
                </div>
              )}

              {qualityWarningPending && qualityCheck && !qualityCheck.is_good && (
                <div className="quality-banner quality-banner-poor">
                  <div className="quality-header-row">
                    <div className="quality-status-text" style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertTriangle size={16} /> Image Quality: POOR ⚠ Please upload a clearer image.
                    </div>
                    <span className="badge-temple" style={{ borderColor: 'rgba(244, 63, 94, 0.5)', color: '#fecdd3' }}>Quality Alert</span>
                  </div>
                  {qualityCheck.issues && qualityCheck.issues.length > 0 && (
                    <ul className="quality-warning-list">
                      {qualityCheck.issues.map((iss, i) => (
                        <li key={i}>{iss}</li>
                      ))}
                    </ul>
                  )}
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn-gold-royal"
                      style={{ fontSize: '0.8rem', padding: '0.55rem 1.1rem' }}
                      onClick={() => runInference(selectedFile)}
                    >
                      <Sparkles size={14} /> Proceed with Prediction Anyway
                    </button>
                    <button
                      className="btn-obsidian-outline"
                      style={{ fontSize: '0.8rem', padding: '0.55rem 1.1rem' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} /> Choose Clearer Idol Photo
                    </button>
                  </div>
                </div>
              )}

              {qualityCheck && qualityCheck.is_good && !result && !isScanning && !isCheckingQuality && (
                <div className="quality-banner quality-banner-good">
                  <div className="quality-header-row">
                    <div className="quality-status-text" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} /> Image Quality: GOOD ✓
                    </div>
                    <div className="quality-chips-row">
                      <span className="quality-chip">Res: {qualityCheck.resolution.width}x{qualityCheck.resolution.height}</span>
                      <span className="quality-chip">Sharpness: {Math.round(qualityCheck.blur_score)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.4rem' }}>
                <button
                  className="btn-gold-royal"
                  style={{ flex: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning || isCheckingQuality}
                >
                  <Upload size={16} /> Choose Another Idol
                </button>
                <button className="btn-obsidian-outline" onClick={resetAll} disabled={isScanning || isCheckingQuality}>
                  <RefreshCw size={16} /> Reset
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div
                className="temple-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="temple-icon-pod">
                  🛕
                </div>
                <h3 className="dropzone-title">
                  Drop Temple Sculpture or Idol Image
                </h3>
                <p className="dropzone-sub">
                  Supports High-Resolution JPG, PNG, WEBP (Stone, Bronze, or Stucco)
                </p>
                <div style={{ display: 'flex', gap: '0.9rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="btn-gold-royal"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload size={16} /> Select Photo
                  </button>
                  <button
                    className="btn-obsidian-outline"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startWebcam();
                    }}
                  >
                    <Camera size={16} /> Camera Snapshot
                  </button>
                </div>
              </div>

              {/* Representative Samples Gallery for fast 1-click verification */}
              {samples.length > 0 && (
                <div style={{ marginTop: '1.6rem' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-400)', fontWeight: 800, marginBottom: '0.7rem' }}>
                    Quick Demo Sculptures
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.55rem' }}>
                    {samples.slice(0, 4).map((sample, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectSample(sample)}
                        style={{
                          background: 'rgba(13, 38, 56, 0.80)',
                          border: '1px solid var(--border-gold-subtle)',
                          borderRadius: '8px',
                          padding: '0.45rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--gold-400)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-gold-subtle)')}
                      >
                        <div style={{ height: '56px', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.35rem', background: '#000' }}>
                          <img src={sample.url} alt={sample.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sample.deity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{
              marginTop: '1.2rem',
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.10)',
              border: '1px solid rgba(239, 68, 68, 0.38)',
              borderRadius: '10px',
              color: '#fecdd3',
              fontSize: '0.86rem'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* ================= RIGHT: DIVINE VERDICT CONSOLE ================= */}
        <div className="temple-frame-card">
          <div className="corner-ornament corner-tl"></div>
          <div className="corner-ornament corner-tr"></div>
          <div className="corner-ornament corner-bl"></div>
          <div className="corner-ornament corner-br"></div>

          {isScanning ? (
            <div style={{ textAlign: 'center', padding: '5.5rem 1.5rem' }}>
              <div className="temple-icon-pod" style={{ animation: 'divineAuraGlow 1.8s infinite ease-in-out' }}>
                <Sparkles size={36} color="var(--gold-300)" />
              </div>
              <h3 style={{ fontSize: '1.45rem', color: '#fff', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
                Deciphering Sacred Iconography...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '380px', margin: '0 auto' }}>
                Extracting 2048-dimensional visual feature vectors & calculating Shilpa Shastra probability distribution.
              </p>
            </div>
          ) : result ? (
            <div className="fade-in">
              {/* Deity Crown Header */}
              <div className="deity-crown-header">
                <div>
                  <div className="badge-temple" style={{ marginBottom: '0.5rem' }}>
                    <ShieldCheck size={13} /> Divine Identification Match
                  </div>
                  <h3 className="deity-name-title serif-heading">
                    {result.best_metadata?.title || result.best_guess.toUpperCase()}
                  </h3>
                  <div className="deity-tamil-tag">
                    {result.best_metadata?.tamil_name} &bull; {result.best_metadata?.aspect}
                  </div>
                </div>

                <div className="crown-gauge">
                  <div className="gauge-percent">{result.best_confidence}%</div>
                  <div className="gauge-sub">Neural Match</div>
                </div>
              </div>

              {/* ================= FEATURE 2: IMAGE QUALITY CHECK DISPLAY ================= */}
              {result.quality_check && (
                result.quality_check.is_good ? (
                  <div className="quality-banner quality-banner-good" style={{ marginTop: 0, marginBottom: '1.3rem' }}>
                    <div className="quality-header-row">
                      <div className="quality-status-text" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={16} /> Image Quality: GOOD ✓
                      </div>
                      <div className="quality-chips-row">
                        <span className="quality-chip">Res: {result.quality_check.resolution.width}x{result.quality_check.resolution.height}</span>
                        <span className="quality-chip">Lighting: {Math.round(result.quality_check.brightness_score)}/255</span>
                        <span className="quality-chip">Focus: {Math.round(result.quality_check.blur_score)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="quality-banner quality-banner-poor" style={{ marginTop: 0, marginBottom: '1.3rem' }}>
                    <div className="quality-header-row">
                      <div className="quality-status-text" style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={16} /> Image Quality: POOR ⚠ Please upload a clearer image.
                      </div>
                      <div className="quality-chips-row">
                        <span className="quality-chip">Res: {result.quality_check.resolution.width}x{result.quality_check.resolution.height}</span>
                        <span className="quality-chip">Focus: {Math.round(result.quality_check.blur_score)}</span>
                      </div>
                    </div>
                    {result.quality_check.issues && result.quality_check.issues.length > 0 && (
                      <div style={{ fontSize: '0.78rem', color: '#fecdd3', marginTop: '0.2rem' }}>
                        Detected: {result.quality_check.issues.join(' • ')}
                      </div>
                    )}
                  </div>
                )
              )}

              {/* ================= FEATURE 1: TOP 3 DEITY PREDICTIONS ================= */}
              <div className="top3-section">
                <div className="top3-header">
                  <div className="top3-title">
                    <Award size={18} color="var(--gold-400)" /> Top 3 Deity Predictions
                  </div>
                  <div className="badge-temple">
                    Ranked Confidence
                  </div>
                </div>
                <div className="top3-list">
                  {result.top3_predictions ? (
                    result.top3_predictions.map((pred) => {
                      const isRank1 = pred.rank === 1;
                      const rankClass = pred.rank === 1 ? 'rank-badge-gold' : pred.rank === 2 ? 'rank-badge-silver' : 'rank-badge-bronze';
                      return (
                        <div key={pred.rank} className={`top3-row ${isRank1 ? 'rank-1' : ''}`}>
                          <div className="top3-row-top">
                            <div className="top3-row-left">
                              <div className={`rank-badge ${rankClass}`}>
                                {pred.rank}
                              </div>
                              <div>
                                <span className="top3-name">{pred.short_name || pred.class}</span>
                                {pred.name && pred.name !== pred.short_name && (
                                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                                    ({pred.name.split('/')[0].trim()})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="top3-conf-pill">
                              {pred.confidence_pct !== undefined ? pred.confidence_pct : Math.round(pred.confidence)}%
                            </div>
                          </div>
                          <div className="top3-track">
                            <div
                              className="top3-fill"
                              style={{
                                width: `${Math.max(pred.confidence, 2)}%`,
                                background: isRank1 ? 'linear-gradient(90deg, #f59e0b 0%, #fde047 100%)' : 'rgba(255, 255, 255, 0.45)'
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Fallback to predictions[:3] if older payload */
                    result.predictions?.slice(0, 3).map((pred, i) => (
                      <div key={pred.class} className={`top3-row ${i === 0 ? 'rank-1' : ''}`}>
                        <div className="top3-row-top">
                          <div className="top3-row-left">
                            <div className={`rank-badge ${i === 0 ? 'rank-badge-gold' : i === 1 ? 'rank-badge-silver' : 'rank-badge-bronze'}`}>
                              {i + 1}
                            </div>
                            <span className="top3-name" style={{ textTransform: 'capitalize' }}>{pred.class}</span>
                          </div>
                          <div className="top3-conf-pill">{Math.round(pred.confidence)}%</div>
                        </div>
                        <div className="top3-track">
                          <div className="top3-fill" style={{ width: `${pred.confidence}%` }}></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ================= FEATURE 3: EXPLAINABLE AI (GRAD-CAM) ================= */}
              {result.gradcam && result.gradcam.success && (
                <div className="gradcam-card">
                  <div className="gradcam-header">
                    <div className="gradcam-title">
                      <Layers size={18} color="var(--gold-400)" /> Explainable AI (Grad-CAM)
                    </div>
                    <div className="badge-temple">
                      ResNet-50 Saliency
                    </div>
                  </div>

                  {/* Saliency Attention Summary */}
                  <div className="gradcam-attention-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-400)', fontWeight: 800 }}>Prediction: </span>
                        <span style={{ fontWeight: 800, color: '#fff' }}>{result.gradcam.predicted_deity || result.best_guess}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-400)', fontWeight: 800 }}>Confidence: </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--gold-300)' }}>{result.gradcam.confidence || result.best_confidence}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="gradcam-attention-highlight">AI Attention: </span>
                      <span>{result.gradcam.attention_summary || "mainly focused on the sculpture's important regions."}</span>
                    </div>
                  </div>

                  {/* Interactive View Mode Tabs */}
                  <div className="gradcam-tabs">
                    <button
                      className={`gradcam-tab-btn ${gradcamView === 'overlay' ? 'active' : ''}`}
                      onClick={() => setGradcamView('overlay')}
                    >
                      Heatmap Overlay
                    </button>
                    <button
                      className={`gradcam-tab-btn ${gradcamView === 'original' ? 'active' : ''}`}
                      onClick={() => setGradcamView('original')}
                    >
                      Original Sculpture
                    </button>
                    <button
                      className={`gradcam-tab-btn ${gradcamView === 'heatmap' ? 'active' : ''}`}
                      onClick={() => setGradcamView('heatmap')}
                    >
                      Attention Heatmap
                    </button>
                    <button
                      className={`gradcam-tab-btn ${gradcamView === 'split' ? 'active' : ''}`}
                      onClick={() => setGradcamView('split')}
                    >
                      Side-by-Side
                    </button>
                  </div>

                  {/* Viewport for Grad-CAM */}
                  <div className="gradcam-display-container">
                    {gradcamView === 'split' ? (
                      <div className="gradcam-split-grid">
                        <div className="gradcam-split-box">
                          <img src={result.gradcam.original_image || previewUrl} alt="Original Sculpture" />
                          <div className="gradcam-split-label">Original</div>
                        </div>
                        <div className="gradcam-split-box">
                          <img src={result.gradcam.overlay_image} alt="Grad-CAM Overlay" />
                          <div className="gradcam-split-label">Grad-CAM</div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={
                          gradcamView === 'original'
                            ? result.gradcam.original_image || previewUrl
                            : gradcamView === 'heatmap'
                            ? result.gradcam.heatmap_image
                            : result.gradcam.overlay_image
                        }
                        alt="Grad-CAM Visualization"
                        className="gradcam-img"
                      />
                    )}
                  </div>

                  {/* Heatmap Color Scale Legend */}
                  <div className="gradcam-legend">
                    <span>Low Attention</span>
                    <div className="gradcam-legend-bar"></div>
                    <span style={{ color: '#f87171', fontWeight: 700 }}>High Saliency</span>
                  </div>

                  <div className="gradcam-footnote">
                    Heatmap visualizes the gradient-weighted activations in ResNet-50 layer4, highlighting the sculpture's crown (kirita-makuta), ayudha emblems, and canonical contours that influenced the model's prediction.
                  </div>
                </div>
              )}

              {/* Complete Neural Confidence Distribution Matrix */}
              <div className="confidence-matrix">
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.7rem' }}>
                  Neural Confidence Distribution (All Canonical Classes)
                </div>
                {result.predictions?.map((pred) => (
                  <div key={pred.class} className="matrix-row">
                    <div className="matrix-labels">
                      <span style={{ textTransform: 'capitalize', fontWeight: 700, color: pred.class === result.best_guess ? 'var(--gold-200)' : 'var(--text-secondary)' }}>
                        {pred.class}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {pred.confidence}%
                      </span>
                    </div>
                    <div className="matrix-track">
                      <div
                        className="matrix-bar-fill fill-gold"
                        style={{ width: `${pred.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Iconography Markers Shelf */}
              {result.best_metadata?.key_features && (
                <div style={{ marginBottom: '1.4rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.7rem' }}>
                    Distinguishing Iconographic Markers
                  </div>
                  <div className="attributes-shelf">
                    {result.best_metadata.key_features.map((feat, i) => (
                      <div key={i} className="attribute-pod">
                        <span className="pod-gem">✦</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sacred Moola Mantra */}
              {result.best_metadata?.sacred_mantra && (
                <div className="mantra-sanctum">
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--gold-400)', fontWeight: 800, letterSpacing: '0.1em' }}>
                      Sacred Moola Mantra
                    </div>
                    <div className="mantra-text">
                      "{result.best_metadata.sacred_mantra}"
                    </div>
                  </div>
                  <button
                    className="btn-obsidian-outline"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                    onClick={() => copyMantra(result.best_metadata.sacred_mantra)}
                  >
                    {copiedMantra ? <Check size={14} color="#10b981" /> : null}
                    {copiedMantra ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}

              {/* Enshrined Temples */}
              {result.recommended_temples && result.recommended_temples.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="temples-shelf-title">
                    Enshrined Sacred Abodes
                  </div>
                  <div className="temple-pod-row">
                    {result.recommended_temples.slice(0, 2).map((temple) => (
                      <div
                        key={temple.id}
                        className="temple-pod-btn"
                        onClick={() => onOpenTempleDossier && onOpenTempleDossier(temple)}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>{temple.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--gold-400)' }}>{temple.location}</div>
                        </div>
                        <ChevronRight size={16} color="var(--gold-400)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-gold-royal"
                  onClick={handleBookmarkToggle}
                  style={{ flex: 1 }}
                >
                  {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {isBookmarked ? 'Archived in Vault' : 'Save to Vault'}
                </button>
                <button className="btn-obsidian-outline" onClick={handleExportJSON} title="Download Dossier JSON">
                  <Download size={16} /> Export Dossier
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '5.5rem 1.5rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3.4rem', marginBottom: '1rem', opacity: 0.85 }}>🔱</div>
              <h3 style={{ fontSize: '1.45rem', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)', marginBottom: '0.6rem' }}>
                Awaiting Sculpture Input
              </h3>
              <p style={{ fontSize: '0.94rem', maxWidth: '380px', margin: '0 auto 1.8rem', color: 'var(--text-secondary)' }}>
                Select a sculpture photo on the left or use your camera to initiate neural iconography identification.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(13, 38, 56, 0.75)', border: '1px solid var(--border-gold-subtle)', padding: '0.55rem 1.1rem', borderRadius: '30px', fontSize: '0.82rem', color: 'var(--gold-300)' }}>
                <span>Canonical Classes: Amman &bull; Murugan &bull; Perumal &bull; Shiva</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

