import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { charactersApi } from '../api/characters';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Input } from '../components/ui/Input';
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
        <div className="flex items-center gap-2">
          {character.category && (
            <Badge variant="purple">{character.category}</Badge>
          )}
          {(character.tags ?? []).slice(0, 2).map((tag) => (
            <Badge key={tag} variant="default">{tag}</Badge>
          ))}
        </div>
        <span className="text-xs text-gray-600">
          {character.chat_count > 0 && `${character.chat_count} chats`}
        </span>
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
    </div>
  );
}

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [category, setCategory] = useState('');
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

  const handleChat = (character: Character) => {
    if (isAuthenticated()) {
      navigate(`/characters?chat=${character.id}`);
    } else {
      navigate(`/login?redirect=/characters&chat=${character.id}`);
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
        ) : (characters?.length ?? 0) === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No characters yet.</p>
            <p className="text-gray-600 text-sm mt-2">Check back soon — new characters are being added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {(characters ?? []).map((char) => (
              <ExploreCard
                key={char.id}
                character={char}
                onChat={() => handleChat(char)}
              />
            ))}
          </div>
        )}

        <div className="border-t border-white/5 py-8 text-center">
          <p className="text-xs text-gray-600">
            Mythic AI — AI-powered roleplay. All characters are fictional.
          </p>
        </div>
      </div>
    </div>
  );
};
