import { api } from './client';
import type { Conversation } from '../types';

export const conversationsApi = {
  list: (params?: { limit?: number; offset?: number; character_id?: string }) =>
    api.get<Conversation[]>('/api/v1/conversations', { params }),

  get: (id: string) => api.get<Conversation>(`/api/v1/conversations/${id}`),

  search: (query: string) =>
    api.get<Conversation[]>('/api/v1/conversations/search', { params: { q: query } }),

  delete: (id: string) => api.delete(`/api/v1/conversations/${id}`),

  /** Export a conversation as JSON string */
  exportJson: (conversation: Conversation): string =>
    JSON.stringify(conversation, null, 2),

  /** Export a conversation as plain text */
  exportText: (conversation: Conversation): string =>
    conversation.messages
      .map((m) => `${m.role === 'user' ? 'You' : 'Mythic AI'}: ${m.content}`)
      .join('\n\n'),
};
