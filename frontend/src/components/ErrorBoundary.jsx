import React from 'react';

/**
 * Catches any unhandled React render errors and shows a fallback UI.
 * Wrap <App /> in main.jsx with this component.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', background: '#020617',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 20, padding: '48px 40px',
          maxWidth: 480, width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{
            fontSize: 22, fontWeight: 700, color: 'white',
            marginBottom: 10,
          }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 28 }}>
            An unexpected error occurred. The team has been notified.
            Please reload the page to continue.
          </p>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, padding: 14, fontSize: 12, color: '#fca5a5',
              textAlign: 'left', overflowX: 'auto', marginBottom: 24,
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
              border: 'none', borderRadius: 10,
              color: 'white', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}
