import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  dashboardAPI: {
    getStats: vi.fn().mockResolvedValue({
      data: {
        totalDocuments: 10,
        totalChats: 25,
        totalEmployees: 5,
        costSaved: 100
      }
    }),
  },
  getErrorMessage: (err) => err?.response?.data?.message || err?.message || 'Error',
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User' },
    isAuthenticated: true,
    loading: false,
  }),
  AuthProvider: ({ children }) => children,
}));

import Dashboard from '../pages/Dashboard';

// ── Helpers ────────────────────────────────────────────────────────────────
function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────
describe('Dashboard page', () => {

  it('renders welcome message with user name', () => {
    renderDashboard();
    expect(screen.getByText(/welcome back, test user/i)).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    renderDashboard();
    expect(screen.getByText(/total documents/i)).toBeInTheDocument();
    expect(screen.getByText(/ai queries/i)).toBeInTheDocument();
    expect(screen.getByText(/active users/i)).toBeInTheDocument();
    expect(screen.getByText(/cost saved/i)).toBeInTheDocument();
  });

  it('renders quick actions section', () => {
    renderDashboard();
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
  });

  it('renders AI Chat button', () => {
    renderDashboard();
    expect(screen.getByText(/ai chat/i)).toBeInTheDocument();
  });

  it('renders Upload File button', () => {
    renderDashboard();
    expect(screen.getByText(/upload file/i)).toBeInTheDocument();
  });

  it('renders View Analytics button', () => {
    renderDashboard();
    expect(screen.getByText(/view analytics/i)).toBeInTheDocument();
  });

});
