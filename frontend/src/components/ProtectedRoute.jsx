import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps any route that requires authentication.
 * Shows a spinner while auth state is loading.
 * Redirects to /login with the attempted path saved in state.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#020617', flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 11,
          background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, color: 'white', fontSize: 16,
        }}>AI</div>
        <div style={{
          width: 32, height: 32,
          border: '3px solid rgba(37,99,235,0.3)',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
