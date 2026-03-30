import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '../api/conversations';
import { charactersApi } from '../api/characters';
import { getErrorMessage } from '../api/client';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { CharacterChatModal } from './CharactersPage';
import type { Character, ChatMessage, Conversation } from '../types';

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function ConversationRow({
  conv,
  onView,
  onContinue,
  onExport,
  onDelete,
}: {
  conv: Conversation;
  onView: () => void;
  onContinue: () => void;
  onExport: (format: 'json' | 'txt') => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <li className="flex items-center gap-3 py-3 group">
      <button
        className="flex-1 text-left min-w-0 hover:opacity-80"
        onClick={onView}
        aria-label={`View conversation: ${conv.title}`}
      >
        <p className="text-sm font-medium text-white truncate">{conv.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {conv.message_count} messages · {formatDate(conv.updated_at)}
          {conv.lora_adapter && (
            <> · <Badge variant="purple" className="ml-1">{conv.lora_adapter}</Badge></>
          )}
        </p>
      </button>

      {/* Continue button */}
      {conv.character_id && (
        <Button
          variant="primary"
          size="sm"
          onClick={onContinue}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
        >
          Continue
        </Button>
      )}

      {/* Export & delete menu */}
      <div className="relative shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMenu((o) => !o)}
          aria-label="Conversation actions"
          aria-haspopup="true"
          aria-expanded={showMenu}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 !p-1.5"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </Button>

        {showMenu && (
          <div
            className="absolute right-0 top-8 z-10 w-40 rounded-lg bg-gray-800 border border-white/10 shadow-xl py-1"
            role="menu"
          >
            {(['json', 'txt'] as const).map((fmt) => (
              <button
                key={fmt}
                role="menuitem"
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                onClick={() => { onExport(fmt); setShowMenu(false); }}
              >
                Export as .{fmt}
              </button>
            ))}
            <hr className="my-1 border-white/10" />
            <button
              role="menuitem"
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
              onClick={() => { onDelete(); setShowMenu(false); }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export const ConversationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewConv, setViewConv] = useState<Conversation | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // Continue-chat state
  const [chatCharacter, setChatCharacter] = useState<Character | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatConversationId, setChatConversationId] = useState<string | undefined>(undefined);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsApi.list({ limit: 100 }).then((r) => r.data),
  });

  const { data: searchResults, isFetching: searching } = useQuery({
    queryKey: ['conversations-search', search],
    queryFn: () => conversationsApi.search(search).then((r) => r.data),
    enabled: search.trim().length >= 2,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => conversationsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setDeleteTarget(null);
    },
    onError: (err) => setDeleteError(getErrorMessage(err)),
  });

  const displayList = search.trim().length >= 2 ? (searchResults ?? []) : (conversations ?? []);

  const handleView = async (conv: Conversation) => {
    setViewLoading(true);
    setViewConv(null);
    try {
      const full = await conversationsApi.get(conv.id).then((r) => r.data);
      setViewConv(full);
    } catch {
      setViewConv({ ...conv, messages: [] });
    } finally {
      setViewLoading(false);
    }
  };

  const handleContinue = async (conv: Conversation) => {
    if (!conv.character_id) return;
    try {
      const [fullConv, char] = await Promise.all([
        conversationsApi.get(conv.id).then((r) => r.data),
        charactersApi.get(conv.character_id).then((r) => r.data),
      ]);
      setChatMessages(fullConv.messages ?? []);
      setChatConversationId(fullConv.id);
      setChatCharacter(char);
    } catch {
      // Fallback: if character was deleted, still show view
      handleView(conv);
    }
  };

  const handleExport = (conv: Conversation, format: 'json' | 'txt') => {
    const content =
      format === 'json'
        ? conversationsApi.exportJson(conv)
        : conversationsApi.exportText(conv);
    const mime = format === 'json' ? 'application/json' : 'text/plain';
    const name = `${conv.title.replace(/\s+/g, '-').slice(0, 40)}.${format}`;
    downloadFile(name, content, mime);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Conversation History</h1>
        {conversations && conversations.length > 0 && (
          <span className="text-sm text-gray-500">{conversations.length} saved</span>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Search conversations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search conversations"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* List */}
      <Card>
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner label="Loading conversations" />
          </div>
        )}

        {!isLoading && displayList.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {search ? 'No conversations match your search.' : 'No saved conversations yet.'}
            </p>
            {!search && (
              <p className="text-xs text-gray-600 mt-1">
                Use the "Save" button in Chat to keep a conversation.
              </p>
            )}
          </div>
        )}

        {displayList.length > 0 && (
          <ul
            className="divide-y divide-white/5"
            role="list"
            aria-label="Saved conversations"
          >
            {displayList.map((conv) => (
              <ConversationRow
                key={conv.id}
                conv={conv}
                onView={() => handleView(conv)}
                onContinue={() => handleContinue(conv)}
                onExport={(fmt) => handleExport(conv, fmt)}
                onDelete={() => { setDeleteError(''); setDeleteTarget(conv); }}
              />
            ))}
          </ul>
        )}
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={!!viewConv || viewLoading}
        onClose={() => { setViewConv(null); setViewLoading(false); }}
        title={viewConv?.title ?? 'Loading…'}
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => viewConv && handleExport(viewConv, 'txt')} disabled={!viewConv}>
              Export .txt
            </Button>
            <Button variant="outline" size="sm" onClick={() => viewConv && handleExport(viewConv, 'json')} disabled={!viewConv}>
              Export .json
            </Button>
            <Button variant="ghost" onClick={() => { setViewConv(null); setViewLoading(false); }}>
              Close
            </Button>
          </>
        }
      >
        {viewLoading && (
          <div className="flex justify-center py-8">
            <Spinner label="Loading messages" />
          </div>
        )}
        {viewConv && viewConv.messages.length === 0 && !viewLoading && (
          <p className="text-sm text-gray-500 text-center py-8">This conversation has no messages.</p>
        )}
        {viewConv && viewConv.messages.length > 0 && (
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {viewConv.messages.map((msg, i) => (
              <div
                key={i}
                className={['flex gap-3', msg.role === 'user' ? 'justify-end' : ''].join(' ')}
              >
                {msg.role !== 'user' && (
                  <div className="h-6 w-6 rounded-full bg-red-700 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5" aria-hidden="true">
                    M
                  </div>
                )}
                <div
                  className={[
                    'max-w-[80%] rounded-xl px-3 py-2 text-sm',
                    msg.role === 'user' ? 'bg-red-700/30 text-white' : 'bg-white/5 text-gray-300',
                  ].join(' ')}
                >
                  <span className="sr-only">{msg.role === 'user' ? 'You' : 'Mythic AI'}: </span>
                  <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete conversation?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-400">
          <strong className="text-white">{deleteTarget?.title}</strong> will be permanently deleted.
        </p>
        {deleteError && (
          <p className="mt-2 text-sm text-red-400" role="alert">{deleteError}</p>
        )}
      </Modal>

      {/* Continue chat modal */}
      <CharacterChatModal
        open={!!chatCharacter}
        onClose={() => setChatCharacter(null)}
        character={chatCharacter}
        initialMessages={chatMessages}
        initialConversationId={chatConversationId}
      />
    </div>
  );
};
