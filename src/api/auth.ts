import { api } from './client';
import type { TokenResponse, User, RegisterRequest } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<TokenResponse>('/api/v1/auth/login', { email, password }),

  register: (data: RegisterRequest) =>
    api.post<TokenResponse>('/api/v1/auth/register', data),

  me: () => api.get<User>('/api/v1/users/me'),

  updateMe: (data: Partial<Pick<User, 'username'>>) =>
    api.patch<User>('/api/v1/users/me', data),
};
