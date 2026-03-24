import { api } from './client';
import type { ChatRequest, ChatResponse, Conversation } from '../types';

export const chatApi = {
  /** Non-streaming completion */
  complete: (data: ChatRequest) =>
    api.post<ChatResponse>('/api/v1/chat/completions', { ...data, stream: false }),

  /** Returns a ReadableStream for SSE streaming completions.
   *  Caller is responsible for reading chunks and parsing delta content. */
  stream: async (data: ChatRequest): Promise<ReadableStream<Uint8Array>> => {
    const token = localStorage.getItem('access_token');
    const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

    const res = await fetch(`${baseUrl}/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...data, stream: true }),
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.body;
  },

  /** Save a conversation */
  saveConversation: (title: string, messages: ChatRequest['messages'], lora_adapter?: string) =>
    api.post<Conversation>('/api/v1/conversations', { title, messages, lora_adapter }),
};
