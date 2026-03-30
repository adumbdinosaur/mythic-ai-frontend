import { MarkdownMessage } from "../components/ui/MarkdownMessage";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainingApi } from '../api/training';
import { chatApi } from '../api/chat';
import { getErrorMessage } from '../api/client';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import type { ChatMessage } from '../types';

interface Message extends ChatMessage {
  id: string;
  isStreaming?: boolean;
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div
      className={['flex w-full', isUser ? 'justify-end' : 'justify-start'].join(' ')}
      role="listitem"
    >
      {!isUser && (
        <div
          className="shrink-0 mr-2 mt-1 h-7 w-7 rounded-full bg-gradient-to-br from-red-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white"
          aria-hidden="true"
        >
          M
        </div>
      )}
      <div
        className={[
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-red-700 text-white rounded-br-sm'
            : 'bg-white/10 text-gray-100 rounded-bl-sm',
        ].join(' ')}
      >
        <span className="sr-only">{isUser ? 'You' : 'Mythic AI'}: </span>
        <MarkdownMessage content={msg.content} className="prose-sm" />
        {msg.isStreaming && (
          <span className="inline-block ml-1 w-1.5 h-4 bg-red-400 animate-pulse rounded-sm" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

let msgCounter = 0;
const nextId = () => String(++msgCounter);

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [selectedAdapter, setSelectedAdapter] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: jobs } = useQuery({
    queryKey: ['training-jobs'],
    queryFn: () => trainingApi.listJobs().then((r) => r.data),
  });

  const completedAdapters = jobs?.filter((j) => j.status === 'completed') ?? [];

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setInput('');
    setError('');

    const userMsg: Message = { id: nextId(), role: 'user', content: text };
    const assistantId = nextId();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', isStreaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    const history: ChatMessage[] = [...messages, userMsg].map(({ role, content }) => ({
      role,
      content,
    }));

    abortRef.current = new AbortController();

    try {
      const stream = await chatApi.stream({
        messages: history,
        stream: true,
        lora_adapter: selectedAdapter || undefined,
        temperature: 0.7,
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content ?? '';
              if (delta) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + delta }
                      : m
                  )
                );
              }
            } catch {
              // ignore malformed chunks
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(getErrorMessage(err));
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
      );
      setStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [input, streaming, messages, selectedAdapter]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleSave = async () => {
    if (messages.length === 0) return;
    setSaveStatus('saving');
    try {
      const title =
        messages.find((m) => m.role === 'user')?.content.slice(0, 60) ?? 'Conversation';
      await chatApi.saveConversation(title, messages, selectedAdapter || undefined);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-white">Chat</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Adapter selector */}
          <label htmlFor="adapter-select" className="sr-only">Select LoRA adapter</label>
          <select
            id="adapter-select"
            className="bg-white/5 border border-white/10 text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-600"
            value={selectedAdapter}
            onChange={(e) => setSelectedAdapter(e.target.value)}
            aria-label="Select LoRA adapter"
          >
            <option value="">Base model</option>
            {completedAdapters.map((j) => (
              <option key={j.id} value={j.adapter_name}>
                {j.adapter_name}
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={handleSave} disabled={messages.length === 0}>
            {saveStatus === 'saving' ? (
              <Spinner size="sm" />
            ) : saveStatus === 'saved' ? (
              '✓ Saved'
            ) : (
              'Save'
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={messages.length === 0}>
            Clear
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto rounded-xl bg-white/3 border border-white/10 p-4"
        role="list"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4" aria-hidden="true">✨</div>
            <p className="text-gray-400">Start a conversation with Mythic AI.</p>
            <p className="text-gray-600 text-sm mt-1">
              Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-xs">Enter</kbd> to send,{' '}
              <kbd className="px-1 py-0.5 rounded bg-white/10 text-xs">Shift+Enter</kbd> for a new line.
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg" role="alert">
          {error}
        </p>
      )}

      {/* Input area */}
      <div className="mt-3 flex gap-2 items-end">
        <label htmlFor="chat-input" className="sr-only">Message</label>
        <textarea
          ref={inputRef}
          id="chat-input"
          rows={1}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={streaming}
          aria-label="Chat message input"
          style={{ minHeight: 48, maxHeight: 160, overflowY: 'auto' }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = 'auto';
            t.style.height = `${Math.min(t.scrollHeight, 160)}px`;
          }}
        />
        {streaming ? (
          <Button variant="danger" size="md" onClick={handleStop} aria-label="Stop generation">
            Stop
          </Button>
        ) : (
          <Button
            size="md"
            onClick={() => void sendMessage()}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            Send
          </Button>
        )}
      </div>
    </div>
  );
};
