import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(false);

  // Get redirect target from query parameter if present
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || '/scanner';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMsg(false);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(redirectTarget);
    } catch (err) {
      setError(err.message || 'Invalid email address or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container fade-in">
      <div className="auth-card temple-frame-card">
        <div className="corner-ornament corner-tl"></div>
        <div className="corner-ornament corner-tr"></div>
        <div className="corner-ornament corner-bl"></div>
        <div className="corner-ornament corner-br"></div>

        {/* Brand Header */}
        <div className="auth-card-header text-center">
          <Link to="/" className="auth-emblem-link">
            <div className="studio-emblem" style={{ margin: '0 auto 0.8rem' }}>🛕</div>
          </Link>
          <div className="badge-temple" style={{ marginBottom: '0.6rem' }}>
            <ShieldCheck size={13} /> Secure Authentication
          </div>
          <h2 className="auth-card-title serif-heading">
            Welcome Back to <span>DeityVision AI</span>
          </h2>
          <p className="auth-card-sub">
            Continue exploring the world of South Indian temple heritage.
          </p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {forgotMsg && (
          <div className="auth-info-banner">
            <Sparkles size={16} />
            <span>Password reset link sent! Check your inbox or contact support.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div className="input-input-wrapper">
              <Mail className="input-field-icon" size={17} />
              <input
                id="email-input"
                type="email"
                className="auth-input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password-input">Password</label>
              <button
                type="button"
                className="forgot-link-btn"
                onClick={() => setForgotMsg(true)}
              >
                Forgot Password?
              </button>
            </div>
            <div className="input-input-wrapper">
              <Lock className="input-field-icon" size={17} />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className="auth-input-field"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pw-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-checkbox-row">
            <label className="checkbox-custom-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-gold-royal auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Studio</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer text-center">
          <p>
            Don't have an account?{' '}
            <Link to={`/signup${location.search}`} className="auth-switch-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
