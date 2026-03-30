import { api } from './client';
import type { Character, CharacterCreate, CharacterUpdate, ChatMessage } from '../types';
import { getStoredToken } from '../utils/auth-token';

export const charactersApi = {
  /** List the current user's characters. */
  mine: (params?: { limit?: number; offset?: number }) =>
    api.get<Character[]>('/api/v1/characters/mine', { params }),

  /** Browse public community characters. */
  listPublic: (params?: { limit?: number; offset?: number; category?: string; tag?: string; search?: string }) =>
    api.get<Character[]>('/api/v1/characters/public', { params }),

  /** Get a random selection of public characters (for dashboard). */
  listRandom: (count = 6) =>
    api.get<Character[]>('/api/v1/characters/public/random', { params: { count } }),

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
  chatStream: async (characterId: string, messages: ChatMessage[], opts?: { max_tokens?: number; temperature?: number; top_p?: number; top_k?: number; repetition_penalty?: number; conversation_id?: string; persona_id?: string }) => {
    const token = getStoredToken();
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
        ...(opts?.top_p != null ? { top_p: opts.top_p } : {}),
        ...(opts?.top_k != null ? { top_k: opts.top_k } : {}),
        ...(opts?.repetition_penalty != null ? { repetition_penalty: opts.repetition_penalty } : {}),
        ...(opts?.conversation_id ? { conversation_id: opts.conversation_id } : {}),
        ...(opts?.persona_id ? { persona_id: opts.persona_id } : {}),
      }),
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.body;
  },

  /** Non-streaming chat with a character. */
  chat: (characterId: string, messages: ChatMessage[], opts?: { max_tokens?: number; temperature?: number; conversation_id?: string }) =>
    api.post(`/api/v1/characters/${encodeURIComponent(characterId)}/chat`, {
      messages,
      stream: false,
      max_tokens: opts?.max_tokens ?? 512,
      temperature: opts?.temperature ?? 0.7,
      ...(opts?.conversation_id ? { conversation_id: opts.conversation_id } : {}),
    }),
};
