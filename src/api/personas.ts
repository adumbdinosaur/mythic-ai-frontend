import { api } from './client';
import type { Persona, PersonaCreate, PersonaUpdate } from '../types';

export const personasApi = {
  /** List the current user's personas. */
  mine: (params?: { limit?: number; offset?: number }) =>
    api.get<Persona[]>('/api/v1/personas/mine', { params }),

  /** Get a single persona by ID. */
  get: (id: string) => api.get<Persona>(`/api/v1/personas/${encodeURIComponent(id)}`),

  /** Create a new persona. */
  create: (data: PersonaCreate) => api.post<Persona>('/api/v1/personas', data),

  /** Update a persona. */
  update: (id: string, data: PersonaUpdate) =>
    api.put<Persona>(`/api/v1/personas/${encodeURIComponent(id)}`, data),

  /** Delete a persona. */
  delete: (id: string) => api.delete(`/api/v1/personas/${encodeURIComponent(id)}`),
};
