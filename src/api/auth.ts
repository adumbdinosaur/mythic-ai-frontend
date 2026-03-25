import { api } from './client';
import type { TokenResponse, User, RegisterRequest, ApiKey, ApiKeyCreated } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<TokenResponse>('/api/v1/auth/login', { email, password }),

  register: (data: RegisterRequest) =>
    api.post<TokenResponse>('/api/v1/auth/register', data),

  me: () => api.get<User>('/api/v1/users/me'),

  updateMe: (data: { name?: string; username?: string }) =>
    api.patch<User>('/api/v1/users/me', data),

  changePassword: (current_password: string, new_password: string) =>
    api.patch<{ message: string }>('/api/v1/users/me/password', {
      current_password,
      new_password,
    }),

  listApiKeys: () => api.get<ApiKey[]>('/api/v1/auth/api-keys'),

  createApiKey: (name: string) =>
    api.post<ApiKeyCreated>('/api/v1/auth/api-keys', { name }),

  revokeApiKey: (id: string) =>
    api.delete(`/api/v1/auth/api-keys/${id}`),
};
