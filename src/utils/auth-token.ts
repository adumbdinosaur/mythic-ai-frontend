/**
 * Auth token storage and retrieval utility.
 *
 * Centralizes JWT token access so that:
 * - Storage format is defined in ONE place (not scattered across client.ts and stores)
 * - Token lifecycle (get/set/clear) is consistent
 * - Changes to storage strategy only affect this module
 *
 * The Zustand persist middleware stores state under 'mythic-auth' key.
 * This utility always reads/writes to that single location.
 */

const STORAGE_KEY = 'mythic-auth';

interface StoredAuthState {
  state?: {
    token?: string | null;
  };
}

/**
 * Get the stored JWT token from persistent storage.
 * @returns JWT token string or null if not found/invalid
 */
export function getStoredToken(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as StoredAuthState;
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Clear the stored auth token and state.
 * Called on logout or 401 errors.
 */
export function clearStoredToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if a valid token is stored.
 * @returns true if token exists and is non-empty
 */
export function hasStoredToken(): boolean {
  return !!getStoredToken();
}
