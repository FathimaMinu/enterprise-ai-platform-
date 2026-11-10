import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  authAPI: {
    login: vi.fn(),
  },
  profileAPI: {
    get: vi.fn(),
  },
  getErrorMessage: (err) => err?.response?.data?.message || err?.message || 'Error',
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login:           vi.fn().mockResolvedValue({ name: 'Test User' }),
    isAuthenticated: false,
    loading:         false,
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import Login from '../pages/Login';

// ── Helpers ────────────────────────────────────────────────────────────────
function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────
describe('Login page', () => {

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/you@company\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  it('renders Sign In button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error when submitting empty form', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/please enter your email/i)).toBeInTheDocument();
    });
  });

  it('fills demo credentials on clicking Fill demo button', async () => {
    renderLogin();
    fireEvent.click(screen.getByText(/fill demo/i));
    const emailInput = screen.getByPlaceholderText(/you@company\.com/i);
    expect(emailInput.value).toBe('admin@enterprise.ai');
  });

  it('shows error when password is missing', async () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/you@company\.com/i);
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
    });
  });

  it('renders link to create account', () => {
    renderLogin();
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

});
