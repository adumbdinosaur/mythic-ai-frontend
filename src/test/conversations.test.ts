import { describe, it, expect } from 'vitest';
import { conversationsApi } from '../api/conversations';
import type { Conversation } from '../types';

const mockConversation: Conversation = {
  id: 'conv-1',
  user_id: 'user-1',
  title: 'Test Conversation',
  messages: [
    { role: 'user', content: 'Hello!' },
    { role: 'assistant', content: 'Hi there!' },
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  message_count: 2,
};

describe('conversationsApi.exportJson', () => {
  it('returns valid JSON string', () => {
    const json = conversationsApi.exportJson(mockConversation);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes all messages', () => {
    const parsed = JSON.parse(conversationsApi.exportJson(mockConversation));
    expect(parsed.messages).toHaveLength(2);
  });
});

describe('conversationsApi.exportText', () => {
  it('formats as readable text', () => {
    const text = conversationsApi.exportText(mockConversation);
    expect(text).toContain('You: Hello!');
    expect(text).toContain('Mythic AI: Hi there!');
  });

  it('separates messages with blank lines', () => {
    const text = conversationsApi.exportText(mockConversation);
    expect(text).toContain('\n\n');
  });
});
