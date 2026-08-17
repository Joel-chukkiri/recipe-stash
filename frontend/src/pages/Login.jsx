import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both your username and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    const result = await login(username.trim(), password);
    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
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
            Welcome back, Chef
          </h1>
          <p className="auth-subtitle" style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Sign in to access your personal recipe cookbook.
          </p>
        </div>

        {/* Error notification */}
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
            <label htmlFor="login-username" className="form-label">
              <span>Username</span>
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
                id="login-username"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem', borderRadius: '16px' }}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              <span>Password</span>
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
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem', borderRadius: '16px' }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

          <button
            id="login-submit-btn"
            type="submit"
            className="btn-stash-primary"
            style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem', fontSize: '1.02rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In to My Stash'}
          </button>
        </form>

        {/* Demo credentials helper */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.85rem 1.1rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '16px',
            border: '1px dashed var(--border-warm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={14} color="var(--primary-coral)" />
              Demo Chef Account
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              chef_julia / password123
            </div>
          </div>
          <button
            type="button"
            className="btn-stash-peach"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
            onClick={() => {
              setUsername('chef_julia');
              setPassword('password123');
            }}
          >
            Auto-Fill
          </button>
        </div>

        {/* Footer */}
        <div className="auth-footer" style={{ marginTop: '1.75rem' }}>
          Don't have a Recipe Stash account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-coral)', fontWeight: 800 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
