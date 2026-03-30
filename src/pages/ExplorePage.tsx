import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { charactersApi } from '../api/characters';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Input } from '../components/ui/Input';
import { ShareButton } from '../components/ui/ShareButton';
import { CharacterDetailModal } from '../components/ui/CharacterDetailModal';
import { CharacterChatModal } from './CharactersPage';
import { useAuthStore } from '../stores/authStore';
import type { Character } from '../types';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'fantasy', label: '⚔️ Fantasy' },
  { value: 'sci-fi', label: '🚀 Sci-Fi' },
  { value: 'romance', label: '💕 Romance' },
  { value: 'horror', label: '🌑 Horror' },
  { value: 'anime', label: '🌸 Anime' },
  { value: 'comedy', label: '😂 Comedy' },
  { value: 'slice-of-life', label: '☕ Slice of Life' },
  { value: 'adventure', label: '🗺️ Adventure' },
];

function ExploreCard({ character, onChat }: { character: Character; onChat: () => void }) {
  const hasNsfw = (character.tags ?? []).some((t: string) =>
    ['nsfw', 'limitless'].includes(t.toLowerCase())
  );

  return (
    <Card
      className="flex flex-col gap-3 cursor-pointer hover:border-red-500/50 hover:bg-white/[0.03] transition-all duration-200 group"
      onClick={onChat}
    >
      <div className="flex items-start gap-3">
        {character.avatar_url ? (
          <img
            src={character.avatar_url}
            alt={character.name}
            className="w-12 h-12 rounded-lg object-cover shrink-0 ring-1 ring-white/10"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-700 to-amber-600 flex items-center justify-center shrink-0 text-lg font-bold text-white">
            {character.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white truncate group-hover:text-red-300 transition-colors">
            {character.name}
          </h3>
          {character.tagline && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{character.tagline}</p>
          )}
        </div>
      </div>

      {character.description && (
        <p className="text-sm text-gray-500 line-clamp-3">{character.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-1.5">
          {hasNsfw && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-600/30 text-red-400 ring-1 ring-red-500/30">
              NSFW
            </span>
          )}
          {character.category && (
            <Badge variant="purple">{character.category}</Badge>
          )}
          {(character.tags ?? [])
            .filter((t: string) => !['nsfw', 'limitless'].includes(t.toLowerCase()))
            .slice(0, 2)
            .map((tag: string) => (
              <Badge key={tag} variant="default">{tag}</Badge>
            ))}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ShareButton character={character} />
          <span className="text-xs text-gray-600">
            {character.chat_count > 0 && `${character.chat_count} chats`}
          </span>
        </div>
      </div>
    </Card>
  );
}

function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="text-center py-12 lg:py-16">
      <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-500 via-amber-400 to-red-500 bg-clip-text text-transparent">
        Mythic AI
      </h1>
      <p className="mt-3 text-lg text-gray-400 max-w-xl mx-auto">
        Uncensored AI characters. No filters. No judgment. Your story, your rules.
      </p>
      {!isAuthenticated() && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button size="lg" onClick={onGetStarted}>
            Get Started Free
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      )}
      <div className="mt-4 flex items-center justify-center">
        <a
          href="https://discord.gg/t4AyfXvKck"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          Join our Discord
        </a>
      </div>
    </div>
  );
}

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [category, setCategory] = useState('');
  const [contentFilter, setContentFilter] = useState<'all' | 'sfw' | 'nsfw'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: characters, isLoading } = useQuery({
    queryKey: ['explore', 'characters', category, debouncedSearch],
    queryFn: () =>
      charactersApi
        .listPublic({
          limit: 50,
          ...(category ? { category } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        })
        .then((r) => r.data),
  });

  const filteredCharacters = (characters ?? []).filter((char) => {
    if (contentFilter === 'all') return true;
    const isNsfw = (char.tags ?? []).some((t: string) =>
      ['nsfw', 'limitless'].includes(t.toLowerCase())
    );
    return contentFilter === 'nsfw' ? isNsfw : !isNsfw;
  });

  const [detailTarget, setDetailTarget] = useState<Character | null>(null);
  const [chatTarget, setChatTarget] = useState<Character | null>(null);

  const handleCardClick = (character: Character) => {
    setDetailTarget(character);
  };

  const handleStartChat = (character: Character) => {
    if (isAuthenticated()) {
      setDetailTarget(null);
      setChatTarget(character);
    } else {
      navigate('/login?redirect=/explore');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {isAuthenticated() && (
        <div className="border-b border-white/10 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-red-400">Mythic AI</span>
            <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard')}>
              Dashboard →
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Hero onGetStarted={() => navigate('/register')} />

        <div className="mb-6 space-y-4">
          <Input
            placeholder="Search characters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md mx-auto"
          />

          <div className="flex items-center justify-center gap-2 mb-3">
            {(['all', 'sfw', 'nsfw'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setContentFilter(f)}
                className={[
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  contentFilter === f
                    ? f === 'nsfw' ? 'bg-red-700 text-white' : 'bg-gray-700 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white',
                ].join(' ')}
              >
                {f === 'all' ? 'All' : f === 'sfw' ? 'SFW' : '🔥 NSFW'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={[
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  category === cat.value
                    ? 'bg-red-700 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white',
                ].join(' ')}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No characters found.</p>
            <p className="text-gray-600 text-sm mt-2">Try a different filter or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {filteredCharacters.map((char) => (
              <ExploreCard
                key={char.id}
                character={char}
                onChat={() => handleCardClick(char)}
              />
            ))}
          </div>
        )}

        <div className="border-t border-white/5 py-8 text-center space-y-2">
          <a
            href="https://discord.gg/t4AyfXvKck"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            Join our Discord
          </a>
          <p className="text-xs text-gray-600">
            Mythic AI — AI-powered roleplay. All characters are fictional.
          </p>
          <div className="flex items-center justify-center gap-3 mt-1">
            <a href="/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms of Service</a>
            <span className="text-gray-700">·</span>
            <a href="/privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>

      {/* Character detail modal */}
      <CharacterDetailModal
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        character={detailTarget}
        onChat={() => detailTarget && handleStartChat(detailTarget)}
        isAuthenticated={isAuthenticated()}
        onLogin={() => navigate('/login?redirect=/explore')}
      />

      {/* Chat modal */}
      <CharacterChatModal
        open={!!chatTarget}
        onClose={() => setChatTarget(null)}
        character={chatTarget}
      />
    </div>
  );
};
