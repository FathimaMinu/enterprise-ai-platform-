import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  chatAPI: {
    sendMessage: vi.fn().mockResolvedValue({
      data: { response: 'This is a test response' }
    }),
    getHistory: vi.fn().mockResolvedValue({
      data: []
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

import Chat from '../pages/Chat';

// ── Helpers ────────────────────────────────────────────────────────────────
function renderChat() {
  return render(
    <MemoryRouter>
      <Chat />
    </MemoryRouter>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────
describe('Chat page', () => {

  it('renders Chat heading', () => {
    renderChat();
    expect(screen.getByText(/ai assistant/i)).toBeInTheDocument();
  });

  it('renders message input box', () => {
    renderChat();
    expect(screen.getByPlaceholderText(/ask anything/i)).toBeInTheDocument();
  });

  it('renders send button', () => {
    renderChat();
    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeInTheDocument();
  });

});
