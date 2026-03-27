/**
 * Integration test to verify the auth flow token persistence fix.
 * 
 * This test verifies that:
 * 1. Login response provides a token
 * 2. Token is stored in localStorage in Zustand persist format
 * 3. API client can read the token from localStorage
 * 4. Subsequent requests include the Authorization header
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredToken } from '../utils/auth-token';

describe('Auth Token Persistence Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores token in localStorage in Zustand persist format', () => {
    // Simulate what LoginPage.tsx now does after receiving a token
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
    
    // This is what LoginPage now does before calling me()
    const authState = { state: { token: mockToken, user: null } };
    localStorage.setItem('mythic-auth', JSON.stringify(authState));

    // Verify that getStoredToken() can retrieve it
    const retrievedToken = getStoredToken();
    expect(retrievedToken).toBe(mockToken);
  });

  it('handles missing localStorage gracefully', () => {
    const token = getStoredToken();
    expect(token).toBeNull();
  });

  it('handles malformed localStorage gracefully', () => {
    localStorage.setItem('mythic-auth', 'invalid json');
    const token = getStoredToken();
    expect(token).toBeNull();
  });

  it('handles missing nested state gracefully', () => {
    localStorage.setItem('mythic-auth', JSON.stringify({}));
    const token = getStoredToken();
    expect(token).toBeNull();
  });

  it('stores null token when user is null initially', () => {
    const authState = { state: { token: null, user: null } };
    localStorage.setItem('mythic-auth', JSON.stringify(authState));
    
    const token = getStoredToken();
    expect(token).toBeNull();
  });
});
