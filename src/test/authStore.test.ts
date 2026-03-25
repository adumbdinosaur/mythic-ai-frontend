import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it('starts unauthenticated', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setAuth sets token and user', () => {
    const user = {
      id: '1',
      email: 'a@b.com',
      username: 'alice',
      tier: 'free' as const,
      is_active: true,
      created_at: '2024-01-01',
    };
    useAuthStore.getState().setAuth('my-token', user);
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    expect(useAuthStore.getState().token).toBe('my-token');
    expect(useAuthStore.getState().user).toEqual(user);
    // Check that Zustand persist middleware stored the state correctly
    const stored = localStorage.getItem('mythic-auth');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.token).toBe('my-token');
    expect(parsed.state.user).toEqual(user);
  });

  it('logout clears token, user, and localStorage', () => {
    const user = {
      id: '1',
      email: 'a@b.com',
      username: 'alice',
      tier: 'free' as const,
      is_active: true,
      created_at: '2024-01-01',
    };
    useAuthStore.getState().setAuth('tok', user);
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});
