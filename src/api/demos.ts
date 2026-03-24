import { api } from './client';
import type { DemoLoRA, DemoRating } from '../types';

export const demosApi = {
  list: (params?: { category?: string; featured?: boolean; limit?: number; offset?: number }) =>
    api.get<DemoLoRA[]>('/api/v1/demos', { params }),

  get: (slug: string) => api.get<DemoLoRA>(`/api/v1/demos/${slug}`),

  rate: (slug: string, data: DemoRating) =>
    api.post(`/api/v1/demos/${slug}/rate`, data),
};
