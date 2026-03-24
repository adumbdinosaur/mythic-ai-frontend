import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';

// Mock the API module
vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn(),
    register: vi.fn(),
    updateMe: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce({
      response: { data: { detail: 'Invalid credentials' } },
      isAxiosError: true,
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('calls authApi.login with email and password', async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({
      data: { access_token: 'tok', token_type: 'bearer' },
    } as never);
    vi.mocked(authApi.me).mockResolvedValueOnce({
      data: { id: '1', email: 'user@example.com', username: 'user', tier: 'free', is_active: true, created_at: '' },
    } as never);

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('user@example.com', 'password123');
    });
  });

  it('has a link to the register page', () => {
    renderLogin();
    const link = screen.getByRole('link', { name: /create one/i });
    expect(link).toHaveAttribute('href', '/register');
  });
});
