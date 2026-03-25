import { api } from './client';
import type {
  AdminStats,
  AdminUser,
  PaginatedUsers,
  PaginatedAuditLog,
} from '../types';

export const adminApi = {
  // Stats
  stats: () => api.get<AdminStats>('/api/v1/admin/stats'),

  // Users
  listUsers: (params?: { limit?: number; offset?: number; tier?: string; role?: string; search?: string }) =>
    api.get<PaginatedUsers>('/api/v1/admin/users', { params }),

  getUser: (id: string) =>
    api.get<AdminUser>(`/api/v1/admin/users/${id}`),

  updateUser: (id: string, data: { tier?: string; role?: string; is_active?: boolean }) =>
    api.patch<AdminUser>(`/api/v1/admin/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete(`/api/v1/admin/users/${id}`),

  resetPassword: (id: string) =>
    api.post<{ temporary_password: string }>(`/api/v1/admin/users/${id}/reset-password`),

  // Audit log
  auditLog: (params?: { limit?: number; offset?: number; action?: string }) =>
    api.get<PaginatedAuditLog>('/api/v1/admin/audit-log', { params }),
};
