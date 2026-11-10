import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaBuilding, FaLock,
  FaEye, FaEyeSlash, FaCheck, FaTimes, FaArrowLeft, FaArrowRight,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import '../styles/register.css';

const validate = {
  name:     (v) => v.trim().length < 2  ? 'Must be at least 2 characters' : '',
  email:    (v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Enter a valid email address' : '',
  company:  ()  => '',
  password: (v) => v.length < 8 ? 'Must be at least 8 characters' : '',
  confirm:  (v, pw) => v !== pw ? 'Passwords do not match' : '',
};

function strengthLevel(pw) {
  if (!pw) return 0;
  if (pw.length < 8)  return 1;
  const extra = (/[A-Z]/.test(pw) ? 1 : 0) + (/\d/.test(pw) ? 1 : 0) + (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  return pw.length >= 12 && extra >= 2 ? 4 : extra >= 1 ? 3 : 2;
}

const STRENGTH_LABEL = ['', 'Too short', 'Weak', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', '#ef4444', '#f59e0b', '#22c55e', '#2563eb'];

function Field({ id, label, icon: Icon, type = 'text', value, onChange, placeholder,
                 autoFocus, fieldState, errorMsg, validMsg, onFocus, onBlur,
                 rightSlot, disabled, inputRef }) {
  return (
    <div className={`reg-field ${fieldState !== 'idle' ? fieldState : ''}`}>
      <label className="reg-label" htmlFor={id}>{label}</label>
      <div className="reg-input-wrap">
        <span className="reg-input-icon"><Icon /></span>
        <input
          ref={inputRef} id={id} type={type} value={value} onChange={onChange}
          onFocus={onFocus} onBlur={onBlur} placeholder={placeholder}
          autoFocus={autoFocus} disabled={disabled}
          autoComplete={id === 'password' || id === 'confirm' ? 'new-password' : id}
          className={`reg-input${rightSlot ? ' has-right' : ''}`}
          spellCheck={false}
        />
        {rightSlot}
        {(fieldState === 'valid' || fieldState === 'error') && (
          <span className="reg-status-icon" style={{ right: rightSlot ? 38 : 12 }}>
            {fieldState === 'valid'
              ? <FaCheck style={{ color: '#4ade80', fontSize: 12 }} />
              : <FaTimes style={{ color: '#f87171', fontSize: 12 }} />}
          </span>
        )}
      </div>
      {fieldState === 'error' && errorMsg && (
        <div className="reg-msg error"><FaTimes size={10} />{errorMsg}</div>
      )}
      {fieldState === 'valid' && validMsg && (
        <div className="reg-msg valid"><FaCheck size={10} />{validMsg}</div>
      )}
    </div>
  );
}

export default function Register() {
  const navigate    = useNavigate();
  const { register } = useAuth();

  const [vals,   setVals]   = useState({ name: '', email: '', company: '', password: '', confirm: '' });
  const [states, setStates] = useState({ name:'idle', email:'idle', company:'idle', password:'idle', confirm:'idle' });
  const [errors, setErrors] = useState({ name:'', email:'', company:'', password:'', confirm:'' });
  const [showPass, setShowPass] = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [globalErr,setGlobalErr]= useState('');
  const [success,  setSuccess]  = useState(false);

  const refs = {
    name:     useRef(null),
    email:    useRef(null),
    company:  useRef(null),
    password: useRef(null),
    confirm:  useRef(null),
  };

  const handleChange = useCallback((field) => (e) => {
    const val = e.target.value;
    setVals((p) => ({ ...p, [field]: val }));
    const err = field === 'confirm' ? validate.confirm(val, vals.password) : validate[field](val);
    setErrors((p) => ({ ...p, [field]: err }));
    setStates((p) => ({ ...p, [field]: val === '' ? 'focused' : err ? 'error' : 'valid' }));
    if (field === 'password' && vals.confirm) {
      const cErr = validate.confirm(vals.confirm, val);
      setErrors((p) => ({ ...p, confirm: cErr }));
      setStates((p) => ({ ...p, confirm: cErr ? 'error' : 'valid' }));
    }
  }, [vals.password, vals.confirm]);

  const handleFocus = (f) => () => setStates((p) => ({ ...p, [f]: p[f] === 'idle' ? 'focused' : p[f] }));
  const handleBlur  = (f) => () => {
    const val = vals[f];
    if (!val) { setStates((p) => ({ ...p, [f]: 'idle' })); return; }
    const err = f === 'confirm' ? validate.confirm(val, vals.password) : validate[f](val);
    setErrors((p) => ({ ...p, [f]: err }));
    setStates((p) => ({ ...p, [f]: err ? 'error' : 'valid' }));
  };

  const fillDemo = () => {
    const d = { name:'John Doe', email:'demo@enterprise.ai', company:'Acme Corp', password:'Demo1234!', confirm:'Demo1234!' };
    setVals(d);
    setStates({ name:'valid', email:'valid', company:'valid', password:'valid', confirm:'valid' });
    setErrors({ name:'', email:'', company:'', password:'', confirm:'' });
    setAgreed(true);
    setGlobalErr('');
    refs.name.current?.focus();
  };

  const isFormValid = () =>
    vals.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email) &&
    vals.password.length >= 8 &&
    vals.password === vals.confirm && agreed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setLoading(true);
    setGlobalErr('');
    try {
      await register(vals.name, vals.email, vals.password, vals.company);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setGlobalErr(getErrorMessage(err));
      setLoading(false);
    }
  };

  const EyeBtn = (
    <button type="button" className="reg-eye" onClick={() => setShowPass((v) => !v)} tabIndex={-1} style={{ right: 12 }}>
      {showPass ? <FaEyeSlash /> : <FaEye />}
    </button>
  );

  const level = strengthLevel(vals.password);

  return (
    <div className="reg-root">
      <div className="reg-orb1" /><div className="reg-orb2" /><div className="reg-orb3" />
      <Link to="/" className="reg-back"><FaArrowLeft size={12} /> Back to home</Link>
      <div className="reg-card">
        {success ? (
          <div className="reg-success">
            <div className="reg-success-icon">✅</div>
            <div className="reg-success-title">Account Created!</div>
            <div className="reg-success-sub">Welcome, <strong style={{color:'white'}}>{vals.name}</strong>! Redirecting…</div>
            <div className="reg-redirect-bar"><div className="reg-redirect-fill" /></div>
          </div>
        ) : (
          <>
            <div className="reg-header">
              <div className="reg-logo">AI</div>
              <h1 className="reg-title">Create your account</h1>
              <p className="reg-subtitle">Start your 14-day free trial. No credit card required.</p>
            </div>
            <div className="reg-demo-bar">
              <span>Try with demo data</span>
              <button type="button" className="reg-demo-fill" onClick={fillDemo}>Fill demo →</button>
            </div>
            {globalErr && <div className="reg-global-error"><FaTimes size={12} /> {globalErr}</div>}
            <form className="reg-form" onSubmit={handleSubmit} noValidate>
              <Field id="name" label="Full Name" icon={FaUser} value={vals.name} onChange={handleChange('name')}
                onFocus={handleFocus('name')} onBlur={handleBlur('name')} placeholder="John Doe"
                autoFocus fieldState={states.name} errorMsg={errors.name} validMsg="Looks good!"
                disabled={loading} inputRef={refs.name} />
              <Field id="email" label="Work Email" icon={FaEnvelope} type="email" value={vals.email}
                onChange={handleChange('email')} onFocus={handleFocus('email')} onBlur={handleBlur('email')}
                placeholder="you@company.com" fieldState={states.email} errorMsg={errors.email}
                validMsg="Valid email" disabled={loading} inputRef={refs.email} />
              <Field id="company" label="Company (optional)" icon={FaBuilding} value={vals.company}
                onChange={handleChange('company')} onFocus={handleFocus('company')} onBlur={handleBlur('company')}
                placeholder="Acme Corporation" fieldState={states.company} disabled={loading} inputRef={refs.company} />
              <Field id="password" label="Password" icon={FaLock} type={showPass ? 'text' : 'password'}
                value={vals.password} onChange={handleChange('password')} onFocus={handleFocus('password')}
                onBlur={handleBlur('password')} placeholder="Min. 8 characters"
                fieldState={states.password} errorMsg={errors.password}
                validMsg={STRENGTH_LABEL[level]} disabled={loading} inputRef={refs.password} rightSlot={EyeBtn} />
              {vals.password && (
                <div className="reg-strength">
                  <div className="reg-strength-bars">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`reg-strength-bar ${i <= level ? `s${level}` : ''}`} />
                    ))}
                  </div>
                  <div className="reg-strength-label" style={{ color: STRENGTH_COLOR[level] }}>
                    {STRENGTH_LABEL[level]}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 18 }}>
                <Field id="confirm" label="Confirm Password" icon={FaLock}
                  type={showPass ? 'text' : 'password'} value={vals.confirm}
                  onChange={handleChange('confirm')} onFocus={handleFocus('confirm')} onBlur={handleBlur('confirm')}
                  placeholder="Repeat password" fieldState={states.confirm} errorMsg={errors.confirm}
                  validMsg="Passwords match" disabled={loading} inputRef={refs.confirm}
                  rightSlot={EyeBtn} />
              </div>
              <label className="reg-terms">
                <input type="checkbox" className="reg-terms-box" checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)} disabled={loading} />
                <span className="reg-terms-text">
                  By creating an account you agree to our{' '}
                  <button type="button" className="reg-terms-link">Terms of Service</button> and{' '}
                  <button type="button" className="reg-terms-link">Privacy Policy</button>
                </span>
              </label>
              <button type="submit" className="reg-submit" disabled={loading || !isFormValid()}>
                {loading ? <><span className="reg-spinner" /> Creating account…</> : <>Create Account <FaArrowRight size={13} /></>}
              </button>
            </form>
            <p className="reg-footer">Already have an account? <Link to="/login">Sign In</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
