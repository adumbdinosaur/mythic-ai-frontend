import { api } from './client';
import type { Character, CharacterCreate, CharacterUpdate, ChatMessage } from '../types';

export const charactersApi = {
  /** List the current user's characters. */
  mine: (params?: { limit?: number; offset?: number }) =>
    api.get<Character[]>('/api/v1/characters/mine', { params }),

  /** Browse public community characters. */
  listPublic: (params?: { limit?: number; offset?: number; category?: string; tag?: string; search?: string }) =>
    api.get<Character[]>('/api/v1/characters/public', { params }),

  /** Get a single character by ID. */
  get: (id: string) => api.get<Character>(`/api/v1/characters/${encodeURIComponent(id)}`),

  /** Create a new character. */
  create: (data: CharacterCreate) => api.post<Character>('/api/v1/characters', data),

  /** Update a character. */
  update: (id: string, data: CharacterUpdate) =>
    api.put<Character>(`/api/v1/characters/${encodeURIComponent(id)}`, data),

  /** Delete a character. */
  delete: (id: string) => api.delete(`/api/v1/characters/${encodeURIComponent(id)}`),

  /** SSE-stream a chat with a character. */
  chatStream: async (characterId: string, messages: ChatMessage[], opts?: { max_tokens?: number; temperature?: number }) => {
    const token = localStorage.getItem('access_token');
    const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

    const res = await fetch(`${baseUrl}/api/v1/characters/${encodeURIComponent(characterId)}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        messages,
        stream: true,
        max_tokens: opts?.max_tokens ?? 512,
        temperature: opts?.temperature ?? 0.7,
      }),
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.body;
  },

  /** Non-streaming chat with a character. */
  chat: (characterId: string, messages: ChatMessage[], opts?: { max_tokens?: number; temperature?: number }) =>
    api.post(`/api/v1/characters/${encodeURIComponent(characterId)}/chat`, {
      messages,
      stream: false,
      max_tokens: opts?.max_tokens ?? 512,
      temperature: opts?.temperature ?? 0.7,
    }),
};
