import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from '../pages/RegisterPage';
import { useAuthStore } from '../stores/authStore';

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
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderRegister() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it('renders all form fields', () => {
    renderRegister();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows password mismatch error', async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/^username/i), { target: { value: 'user123' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password2' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('shows username too short error', async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/^username/i), { target: { value: 'ab' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/at least 3 characters/i)).toBeInTheDocument();
  });

  it('has a link back to login', () => {
    renderRegister();
    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});
