import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 80, fontWeight: 900, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, marginBottom: 16 }}>404</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: '0 0 12px' }}>Page Not Found</h1>
      <p style={{ color: '#64748b', fontSize: 16, maxWidth: 360, margin: '0 0 32px', lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ padding: '11px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          ← Go Back
        </button>
        <Link to="/" style={{ padding: '11px 24px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', borderRadius: 10, color: 'white', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          Home
        </Link>
        <Link to="/dashboard" style={{ padding: '11px 24px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10, color: '#60a5fa', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}
