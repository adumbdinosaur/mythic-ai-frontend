import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types';
import { getStoredToken, clearStoredToken } from '../utils/auth-token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to /login on 401
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiError>) => {
    if (err.response?.status === 401) {
      clearStoredToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

/** Extract a human-readable error message from an Axios error. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiError | undefined;
    if (!data) return err.message;
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) return data.detail.map((d) => d.msg).join(', ');
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}

/** Base URL used for raw fetch calls (e.g. SSE streaming). */
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
