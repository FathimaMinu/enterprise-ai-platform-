import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  documentAPI: {
    list: vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'test.pdf', type: 'application/pdf', size: 1024, status: 'processed', uploadedBy: 'test@example.com' }
      ]
    }),
    upload: vi.fn(),
    delete: vi.fn(),
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

import Documents from '../pages/Documents';

// ── Helpers ────────────────────────────────────────────────────────────────
function renderDocuments() {
  return render(
    <MemoryRouter>
      <Documents />
    </MemoryRouter>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────
describe('Documents page', () => {

  it('renders Documents heading', () => {
    renderDocuments();
    expect(screen.getByText(/documents/i)).toBeInTheDocument();
  });

  it('renders Upload Document button', () => {
    renderDocuments();
    expect(screen.getByRole('button', { name: /upload document/i })).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderDocuments();
    expect(screen.getByPlaceholderText(/search documents/i)).toBeInTheDocument();
  });

  it('renders table headers', () => {
    renderDocuments();
    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/type/i)).toBeInTheDocument();
    expect(screen.getByText(/uploaded by/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
    expect(screen.getByText(/actions/i)).toBeInTheDocument();
  });

});
