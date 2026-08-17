import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Lock, User as UserIcon, Mail, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (!formData.password) {
      setError('Please enter a password.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsLoading(true);

    const result = await register(
      formData.username.trim(),
      formData.email.trim(),
      formData.password,
      formData.passwordConfirm
    );

    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page page-entrance">
      <div className="auth-card" style={{ borderRadius: '32px', padding: '2.75rem 2.25rem', border: '1px solid var(--border-warm)' }}>
        {/* Header */}
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-wrapper" style={{ justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div className="brand-emblem" style={{ width: '46px', height: '46px' }}>
              <Utensils size={22} strokeWidth={2.5} />
            </div>
            <span className="brand-title" style={{ fontSize: '1.75rem' }}>
              Recipe Stash<span className="brand-dot">.</span>
            </span>
          </div>

          <h1 className="auth-title font-serif" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
            Create Your Stash
          </h1>
          <p className="auth-subtitle" style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Never lose another recipe from the internet again.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid #FEE2E2',
              borderRadius: '14px',
              color: 'var(--danger)',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-username" className="form-label">
              <span>Username *</span>
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon
                size={18}
                style={{
                  position: 'absolute',
                  left: '1.1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="reg-username"
                name="username"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem', borderRadius: '16px' }}
                placeholder="Choose your chef username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              <span>Email address (optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '1.1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.75rem', borderRadius: '16px' }}
                placeholder="you@recipestash.app"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">
              <span>Password (min. 6 characters) *</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '1.1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem', borderRadius: '16px' }}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                  padding: '2px',
                  display: 'flex',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password-confirm" className="form-label">
              <span>Confirm Password *</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '1.1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="reg-password-confirm"
                name="passwordConfirm"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.75rem', borderRadius: '16px' }}
                placeholder="Re-enter your password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="btn-stash-primary"
            style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem', fontSize: '1.02rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create My Recipe Stash'}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer" style={{ marginTop: '1.75rem' }}>
          Already have a stash?{' '}
          <Link to="/login" style={{ color: 'var(--primary-coral)', fontWeight: 800 }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
