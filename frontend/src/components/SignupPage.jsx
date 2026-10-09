import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || '/scanner';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }
    if (!acceptedTerms) {
      setError('You must accept the terms & privacy policy to register.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate(redirectTarget);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            <ShieldCheck size={13} /> Account Registration
          </div>
          <h2 className="auth-card-title serif-heading">
            Create Your <span>DeityVision AI</span> Account
          </h2>
          <p className="auth-card-sub">
            Join the South Indian temple heritage & iconography platform.
          </p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name-input">Full Name</label>
            <div className="input-input-wrapper">
              <User className="input-field-icon" size={17} />
              <input
                id="name-input"
                type="text"
                className="auth-input-field"
                placeholder="Raja Raman"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email-input">Email Address</label>
            <div className="input-input-wrapper">
              <Mail className="input-field-icon" size={17} />
              <input
                id="signup-email-input"
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
            <label className="form-label" htmlFor="signup-pw-input">Password (min 6 chars)</label>
            <div className="input-input-wrapper">
              <Lock className="input-field-icon" size={17} />
              <input
                id="signup-pw-input"
                type={showPassword ? 'text' : 'password'}
                className="auth-input-field"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-pw-input">Confirm Password</label>
            <div className="input-input-wrapper">
              <Lock className="input-field-icon" size={17} />
              <input
                id="confirm-pw-input"
                type={showPassword ? 'text' : 'password'}
                className="auth-input-field"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-checkbox-row">
            <label className="checkbox-custom-label">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>I accept the Terms of Service & Privacy Policy</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-gold-royal auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Account & Get Started</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer text-center">
          <p>
            Already have an account?{' '}
            <Link to={`/login${location.search}`} className="auth-switch-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
