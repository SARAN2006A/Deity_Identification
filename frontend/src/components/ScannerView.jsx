import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Sparkles, CheckCircle2, Bookmark, BookmarkCheck, ArrowRight, RefreshCw, Download, Info } from 'lucide-react';

export default function ScannerView({ onNavigateToTemples }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [samples, setSamples] = useState([]);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Load sample gallery on mount
  useEffect(() => {
    fetch('/api/samples')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && data.samples) {
          setSamples(data.samples);
        }
      })
      .catch((err) => console.log('Could not load samples:', err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setIsBookmarked(false);
    runPrediction(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const runPrediction = async (file) => {
    setIsScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to process image');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during identification');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectSample = async (sample) => {
    try {
      setIsScanning(true);
      setError(null);
      setPreviewUrl(sample.url);
      setResult(null);

      const res = await fetch(sample.url);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: blob.type || 'image/jpeg' });
      setSelectedFile(file);
      await runPrediction(file);
    } catch (err) {
      setError('Failed to load sample image: ' + err.message);
      setIsScanning(false);
    }
  };

  // Webcam capture functionality
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
      console.error('Bookmark error:', err);
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

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setIsBookmarked(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fade-in">
      <div className="hero-banner">
        <div className="hero-pill">
          <Sparkles size={14} /> ResNet-50 Deep Learning Model Ready
        </div>
        <h1 className="hero-title">
          South Indian Temple Deity Identification
        </h1>
        <p className="hero-desc">
          Upload or capture any stone carving, bronze icon, or temple idol. Our neural network analyzes sacred iconography, weapons, mounts, and divine attributes with high accuracy.
        </p>
      </div>

      <div className="scanner-grid">
        {/* Left Column: Image Upload / Preview */}
        <div className="glass-panel upload-card">
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
                style={{ width: '100%', maxHeight: '380px', borderRadius: '12px', background: '#000' }}
              />
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1rem' }}>
                <button className="btn-gold" onClick={captureWebcam}>
                  <Camera size={18} /> Capture Snapshot
                </button>
                <button className="btn-outline" onClick={stopWebcam}>
                  Cancel
                </button>
              </div>
            </div>
          ) : previewUrl ? (
            <div>
              <div className="preview-wrapper">
                <img src={previewUrl} alt="Preview" className="preview-img" />
                {isScanning && <div className="scan-laser"></div>}
              </div>

              <div className="upload-actions">
                <button
                  className="btn-gold"
                  style={{ flex: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                >
                  <Upload size={17} /> Change Image
                </button>
                <button className="btn-outline" onClick={resetScanner} disabled={isScanning}>
                  <RefreshCw size={17} /> Clear
                </button>
              </div>
            </div>
          ) : (
            <div
              className="dropzone-container"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="dropzone-icon-box">
                <Upload size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>
                Drag and drop sculpture image
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
                Supports JPG, PNG, WEBP (Ideal: high resolution close-up)
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  className="btn-gold"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload size={16} /> Browse Files
                </button>
                <button
                  className="btn-outline"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startWebcam();
                  }}
                >
                  <Camera size={16} /> Use Camera
                </button>
              </div>
            </div>
          )}

          {/* Quick Test Samples */}
          {samples.length > 0 && (
            <div className="sample-section">
              <div className="sample-title">
                <Sparkles size={14} /> Quick One-Click Benchmark Samples
              </div>
              <div className="sample-grid">
                {samples.map((s, idx) => (
                  <div
                    key={idx}
                    className="sample-chip"
                    onClick={() => handleSelectSample(s)}
                    title={`Test with ${s.title}`}
                  >
                    <img src={s.url} alt={s.title} className="sample-thumbnail" />
                    <div className="sample-name">{s.deity}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: '1.2rem',
              padding: '0.9rem 1.1rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '0.88rem'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Right Column: AI Identification Results */}
        <div className="glass-panel result-card">
          {isScanning ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div className="dropzone-icon-box" style={{ animation: 'pulseGlow 1.5s infinite ease-in-out' }}>
                <Sparkles size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.4rem' }}>
                Analyzing Sacred Iconography...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Extracting deep ResNet-50 visual feature embeddings & cross-entropy weights
              </p>
            </div>
          ) : result ? (
            <div className="fade-in">
              <div className="result-header">
                <div>
                  <div className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
                    <CheckCircle2 size={13} /> High-Confidence Match
                  </div>
                  <h2 className="result-deity-title">
                    {result.best_metadata?.title || result.best_guess.toUpperCase()}
                  </h2>
                  <div className="result-deity-subtitle">
                    {result.best_metadata?.tamil_name} &bull; {result.best_metadata?.aspect}
                  </div>
                </div>

                <div className="confidence-gauge">
                  <div className="confidence-val">{result.best_confidence}%</div>
                  <div className="confidence-label">Confidence</div>
                </div>
              </div>

              {/* Class Probability Distribution */}
              <div className="breakdown-box">
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  Neural Confidence Distribution
                </div>
                {result.predictions?.map((pred) => (
                  <div key={pred.class} className="breakdown-item">
                    <div className="breakdown-labels">
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{pred.class}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{pred.confidence}%</span>
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

              {/* Iconography Attribute Badges */}
              {result.best_metadata?.key_features && (
                <div style={{ marginBottom: '1.4rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.7rem', letterSpacing: '0.05em' }}>
                    Distinguishing Iconographic Markers
                  </div>
                  <div className="iconography-grid">
                    {result.best_metadata.key_features.map((feat, i) => (
                      <div key={i} className="iconography-pill">
                        <span className="iconography-pill-icon">✦</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Associated Famous Temples */}
              {result.recommended_temples && result.recommended_temples.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="temples-rec-title">
                    <span>Famous Abodes & Temples</span>
                  </div>
                  {result.recommended_temples.slice(0, 2).map((temple) => (
                    <div
                      key={temple.id}
                      className="temple-mini-card"
                      onClick={() => onNavigateToTemples && onNavigateToTemples(result.best_guess)}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{temple.name}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{temple.location}</div>
                      </div>
                      <ArrowRight size={16} color="var(--gold-400)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className={isBookmarked ? 'btn-outline' : 'btn-gold'}
                  onClick={handleBookmarkToggle}
                  style={{ flex: 1 }}
                >
                  {isBookmarked ? <BookmarkCheck size={16} color="#10b981" /> : <Bookmark size={16} />}
                  {isBookmarked ? 'Saved to Bookmarks' : 'Bookmark Scan'}
                </button>
                <button className="btn-outline" onClick={handleExportJSON} title="Download Prediction Report">
                  <Download size={16} /> Export JSON
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>🔍</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Awaiting Sculpture Upload
              </h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '340px', margin: '0 auto 1.5rem' }}>
                Select an image on the left or click one of the quick test samples to inspect neural predictions.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.04)', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
                <Info size={14} color="var(--gold-400)" /> Supported: Amman, Murugan, Perumal, Shivan
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
