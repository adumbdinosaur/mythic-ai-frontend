import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { charactersApi } from '../api/characters';
import { getErrorMessage } from '../api/client';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import type { Character, CharacterCreate, CharacterVisibility, ChatMessage } from '../types';
import { useAuthStore } from '../stores/authStore';
import type { Tier } from '../types';

// ─── Tier context-window caps ────────────────────────────────────────────────

const TIER_CONTEXT_LIMIT: Record<Tier, number> = {
  free: 4096,
  plus: 16384,
  pro: 32768,
};

// ─── Category presets ────────────────────────────────────────────────────────

const CATEGORIES = ['anime', 'fantasy', 'sci-fi', 'romance', 'horror', 'comedy', 'slice-of-life', 'adventure', 'other'];

// ─── Tab selector ────────────────────────────────────────────────────────────

type Tab = 'mine' | 'community';

// ─── Character card ──────────────────────────────────────────────────────────

function CharacterCard({
  character,
  isMine,
  onChat,
  onEdit,
  onDelete,
}: {
  character: Character;
  isMine: boolean;
  onChat: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Card className="flex flex-col gap-3 hover:border-white/20 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
            {character.name}
          </h3>
          {character.tagline && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{character.tagline}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {character.visibility === 'public' && <Badge variant="success">Public</Badge>}
          {character.visibility === 'unlisted' && <Badge variant="info">Unlisted</Badge>}
          {character.visibility === 'private' && <Badge variant="default">Private</Badge>}
        </div>
      </div>

      {character.description && (
        <p className="text-sm text-gray-400 line-clamp-3">{character.description}</p>
      )}

      <div className="flex flex-wrap gap-1">
        {character.category && (
          <span className="text-xs text-purple-400 bg-purple-400/10 rounded-full px-2 py-0.5">
            {character.category}
          </span>
        )}
        {(character.tags || []).slice(0, 4).map((tag) => (
          <span key={tag} className="text-xs text-gray-500 bg-white/5 rounded-full px-2 py-0.5">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-auto">
        <span className="text-xs text-gray-500">{character.chat_count} chats</span>
        <div className="flex gap-2">
          {isMine && onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
          )}
          {isMine && onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onChat}>Chat</Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Create / Edit modal ─────────────────────────────────────────────────────

function CharacterFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CharacterCreate) => void;
  initial?: Character | null;
  loading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [tagline, setTagline] = useState(initial?.tagline ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [personality, setPersonality] = useState(initial?.personality ?? '');
  const [greeting, setGreeting] = useState(initial?.greeting ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [tagsStr, setTagsStr] = useState((initial?.tags ?? []).join(', '));
  const [visibility, setVisibility] = useState<CharacterVisibility>(initial?.visibility ?? 'private');
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatar_url ?? '');

  // Reset form when modal opens with different data
  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setTagline(initial?.tagline ?? '');
      setDescription(initial?.description ?? '');
      setPersonality(initial?.personality ?? '');
      setGreeting(initial?.greeting ?? '');
      setCategory(initial?.category ?? '');
      setTagsStr((initial?.tags ?? []).join(', '));
      setVisibility(initial?.visibility ?? 'private');
      setAvatarUrl(initial?.avatar_url ?? '');
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onSubmit({
      name,
      tagline: tagline || undefined,
      description: description || undefined,
      personality,
      greeting: greeting || undefined,
      category: category || undefined,
      tags: tags.length ? tags : undefined,
      avatar_url: avatarUrl || undefined,
      visibility,
    });
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={initial ? 'Edit Character' : 'Create Character'} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
        <Input label="Name" placeholder="e.g. Luna the Necromancer" value={name} onChange={(e) => setName(e.target.value)} required />

        <Input label="Tagline" placeholder="A short one-liner" value={tagline} onChange={(e) => setTagline(e.target.value)} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">Description</label>
          <textarea
            className="w-full rounded-lg bg-white/5 border border-white/10 hover:border-white/20 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-150 min-h-[60px]"
            placeholder="Describe what this character is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">
            Personality / System Prompt <span className="text-red-400">*</span>
          </label>
          <textarea
            className="w-full rounded-lg bg-white/5 border border-white/10 hover:border-white/20 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-150 min-h-[120px]"
            placeholder="You are Luna, an ancient necromancer who speaks in riddles..."
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            required
            rows={5}
          />
          <p className="text-xs text-gray-500">This is the system prompt sent to the model. Describe the character's personality, speaking style, and any rules they should follow.</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">Greeting Message</label>
          <textarea
            className="w-full rounded-lg bg-white/5 border border-white/10 hover:border-white/20 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-150 min-h-[60px]"
            placeholder="*Luna adjusts her dark hood and fixes you with glowing eyes* Well, well... a visitor."
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            rows={2}
          />
          <p className="text-xs text-gray-500">The first message shown when someone starts a chat with this character.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">Category</label>
            <select
              className="w-full rounded-lg bg-white/5 border border-white/10 hover:border-white/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-150"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">None</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">Visibility</label>
            <select
              className="w-full rounded-lg bg-white/5 border border-white/10 hover:border-white/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-150"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as CharacterVisibility)}
            >
              <option value="private">Private — only you</option>
              <option value="unlisted">Unlisted — anyone with link</option>
              <option value="public">Public — community browse</option>
            </select>
          </div>
        </div>

        <Input label="Tags" placeholder="anime, necromancer, dark (comma-separated)" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} />

        <Input label="Avatar URL" placeholder="https://..." value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{initial ? 'Save Changes' : 'Create Character'}</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Chat modal ──────────────────────────────────────────────────────────────

function CharacterChatModal({
  open,
  onClose,
  character,
}: {
  open: boolean;
  onClose: () => void;
  character: Character | null;
}) {
  const tier = useAuthStore((s) => s.user?.tier ?? 'free') as Tier;
  const maxContext = TIER_CONTEXT_LIMIT[tier];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [contextWindow, setContextWindow] = useState(Math.min(4096, maxContext));
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (open && character) {
      setContextWindow(Math.min(character.context_window ?? 4096, maxContext));
      if (character.greeting) {
        setMessages([{ role: 'assistant', content: character.greeting }]);
      } else {
        setMessages([]);
      }
      setInput('');
      setConversationId(undefined);
      // Focus the input after the modal renders
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, character]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Refocus input when streaming finishes
  React.useEffect(() => {
    if (!streaming) {
      inputRef.current?.focus();
    }
  }, [streaming]);

  const handleSend = async () => {
    if (!input.trim() || !character || streaming) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setStreaming(true);

    try {
      const stream = await charactersApi.chatStream(character.id, updated, { conversation_id: conversationId });
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      // Append an empty assistant message that we'll fill token-by-token
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE lines
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            // Pick up conversation_id from the final auto-save event
            if (parsed.conversation_id && !parsed.choices) {
              setConversationId(parsed.conversation_id);
              continue;
            }
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: assistantContent };
                return copy;
              });
            }
          } catch {
            // skip unparsable lines
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${getErrorMessage(err)}` },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!character) return null;

  return (
    <Modal isOpen={open} onClose={onClose} title={`Chat with ${character.name}`} size="xl">
      <div className="flex flex-col h-[80vh]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
          {messages.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">Start a conversation with {character.name}!</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={[
                  'max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-purple-600/30 text-white'
                    : 'bg-white/5 text-gray-200',
                ].join(' ')}
              >
                {msg.content || (streaming && i === messages.length - 1 ? (
                  <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse rounded-sm" />
                ) : null)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Context window slider */}
        <div className="flex items-center gap-3 border-t border-white/10 pt-2 pb-2">
          <label className="text-xs text-gray-400 whitespace-nowrap">Context: {contextWindow.toLocaleString()}</label>
          <input
            type="range"
            min={512}
            max={maxContext}
            step={512}
            value={contextWindow}
            onChange={(e) => setContextWindow(Number(e.target.value))}
            className="flex-1 accent-purple-500 h-1"
          />
        </div>

        {/* Input */}
        <div className="flex gap-2 border-t border-white/10 pt-3">
          <textarea
            ref={inputRef}
            className="flex-1 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-150 resize-none"
            placeholder={`Message ${character.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={streaming}
          />
          <Button onClick={handleSend} disabled={!input.trim() || streaming} loading={streaming} className="self-end">
            Send
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export const CharactersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Character | null>(null);
  const [chatTarget, setChatTarget] = useState<Character | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Character | null>(null);

  // Queries
  const myChars = useQuery({
    queryKey: ['characters', 'mine'],
    queryFn: () => charactersApi.mine().then((r) => r.data),
    enabled: tab === 'mine',
  });

  const publicChars = useQuery({
    queryKey: ['characters', 'public', searchQuery],
    queryFn: () => charactersApi.listPublic({ search: searchQuery || undefined }).then((r) => r.data),
    enabled: tab === 'community',
  });

  // Mutations
  const createMut = useMutation({
    mutationFn: (data: CharacterCreate) => charactersApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      setFormOpen(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CharacterCreate }) =>
      charactersApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      setEditing(null);
      setFormOpen(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => charactersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      setDeleteTarget(null);
    },
  });

  const chars = tab === 'mine' ? myChars.data : publicChars.data;
  const loading = tab === 'mine' ? myChars.isLoading : publicChars.isLoading;
  const error = tab === 'mine' ? myChars.error : publicChars.error;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Characters</h1>
          <p className="text-gray-400 text-sm mt-1">Create your own characters or browse community creations</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Character
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('mine')}
          className={[
            'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
            tab === 'mine' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white',
          ].join(' ')}
        >
          My Characters
        </button>
        <button
          onClick={() => setTab('community')}
          className={[
            'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
            tab === 'community' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white',
          ].join(' ')}
        >
          Community
        </button>
      </div>

      {/* Search (community tab) */}
      {tab === 'community' && (
        <div className="max-w-md">
          <Input
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
          {getErrorMessage(error)}
        </div>
      )}

      {!loading && !error && chars && chars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">
            {tab === 'mine'
              ? "You haven't created any characters yet. Click \"New Character\" to get started!"
              : 'No public characters found. Be the first to share one!'}
          </p>
        </div>
      )}

      {!loading && chars && chars.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {chars.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              isMine={tab === 'mine'}
              onChat={() => setChatTarget(c)}
              onEdit={() => { setEditing(c); setFormOpen(true); }}
              onDelete={() => setDeleteTarget(c)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <CharacterFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={(data) => {
          if (editing) {
            updateMut.mutate({ id: editing.id, data });
          } else {
            createMut.mutate(data);
          }
        }}
        initial={editing}
        loading={createMut.isPending || updateMut.isPending}
      />

      {/* Chat modal */}
      <CharacterChatModal
        open={!!chatTarget}
        onClose={() => setChatTarget(null)}
        character={chatTarget}
      />

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Character">
        <p className="text-sm text-gray-300 mb-4">
          Are you sure you want to delete <strong className="text-white">{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            loading={deleteMut.isPending}
            onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
