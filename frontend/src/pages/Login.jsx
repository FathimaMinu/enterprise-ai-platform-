import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import '../styles/login.css';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm]       = useState({ email: '', password: '', remember: true });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState('');

  const set = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const fillDemo = () => {
    setForm((p) => ({ ...p, email: 'admin@enterprise.ai', password: 'admin123' }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email)    return setError('Please enter your email address.');
    if (!form.password) return setError('Please enter your password.');
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-bg-orb1" />
      <div className="login-bg-orb2" />

      <Link to="/" className="login-back">
        <FaArrowLeft size={13} /> Back to home
      </Link>

      <div className="login-card">
        <div className="login-logo-wrap">
          <div className="login-logo">AI</div>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your enterprise workspace</p>
        </div>

        {/* Demo hint */}
        <div className="login-demo-hint">
          <span>Use admin@enterprise.ai / admin123</span>
          <button type="button" className="login-demo-btn" onClick={fillDemo}>
            Fill demo →
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label className="login-label">Email address</label>
            <div className="login-input-wrap">
              <span className="login-input-icon"><FaEnvelope /></span>
              <input
                type="email" className="login-input"
                placeholder="you@company.com"
                value={form.email} onChange={set('email')}
                autoComplete="email" disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <div className="login-field-header">
              <label className="login-label">Password</label>
              <button type="button" className="login-forgot">Forgot password?</button>
            </div>
            <div className="login-input-wrap">
              <span className="login-input-icon"><FaLock /></span>
              <input
                type={showPass ? 'text' : 'password'} className="login-input pr"
                placeholder="••••••••"
                value={form.password} onChange={set('password')}
                autoComplete="current-password" disabled={loading}
              />
              <button type="button" className="login-eye" tabIndex={-1}
                onClick={() => setShowPass((v) => !v)}>
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <label className="login-remember">
            <input type="checkbox" checked={form.remember} onChange={set('remember')} />
            <span>Remember me for 30 days</span>
          </label>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer-text">
          Don't have an account?{' '}
          <Link to="/register" className="login-footer-link">Create account</Link>
        </p>
      </div>
    </div>
  );
}
