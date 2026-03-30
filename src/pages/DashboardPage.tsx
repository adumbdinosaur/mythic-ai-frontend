import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { conversationsApi } from '../api/conversations';
import { charactersApi } from '../api/characters';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { CharacterChatModal } from './CharactersPage';
import { TIER_LABELS } from '../types';
import type { Character } from '../types';

function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Card>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </Card>
  );
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [chatTarget, setChatTarget] = useState<Character | null>(null);

  const { data: conversations } = useQuery({
    queryKey: ['conversations-count'],
    queryFn: () => conversationsApi.list({ limit: 1 }).then((r) => r.data),
  });

  const { data: randomChars, isLoading: charsLoading } = useQuery({
    queryKey: ['characters', 'random'],
    queryFn: () => charactersApi.listRandom(6).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.username ?? 'there'} 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Here's what's happening with your Mythic AI account.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Plan"
          value={
            <span>{TIER_LABELS[user?.tier ?? 'free']}</span>
          }
          sub={undefined}
        />
        <StatCard
          label="Context window"
          value={
            (() => {
              const t = user?.tier ?? 'free';
              const map: Record<string, string> = { free: '4k', plus: '16k', pro: '32k' };
              return map[t] ?? '4k';
            })()
          }
          sub="token limit"
        />
        <StatCard
          label="Conversations"
          value={(conversations?.length ?? '—')}
          sub="saved"
        />
      </div>

      {/* Training panel hidden — re-enable when TRAINING_ENABLED=true */}

      {/* Featured characters */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Characters to chat with</h2>
        {charsLoading && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}
        {!charsLoading && randomChars && randomChars.length === 0 && (
          <p className="text-sm text-gray-500">No public characters available yet.</p>
        )}
        {!charsLoading && randomChars && randomChars.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {randomChars.map((c) => (
              <Card key={c.id} className="flex flex-col gap-2 hover:border-white/20 transition-colors cursor-pointer group" onClick={() => setChatTarget(c)}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white truncate group-hover:text-red-300 transition-colors">
                    {c.name}
                  </h3>
                  {c.category && (
                    <span className="text-xs text-red-400 bg-red-400/10 rounded-full px-2 py-0.5 shrink-0">
                      {c.category}
                    </span>
                  )}
                </div>
                {c.tagline && <p className="text-xs text-gray-400 truncate">{c.tagline}</p>}
                {c.description && <p className="text-sm text-gray-400 line-clamp-2">{c.description}</p>}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-auto">
                  <span className="text-xs text-gray-500">{c.chat_count} chats</span>
                  <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); setChatTarget(c); }}>Chat</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Chat modal */}
      <CharacterChatModal
        open={!!chatTarget}
        onClose={() => setChatTarget(null)}
        character={chatTarget}
      />
    </div>
  );
};
