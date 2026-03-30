import React from 'react';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { Button } from './Button';
import { ShareButton } from './ShareButton';
import type { Character } from '../../types';

interface CharacterDetailModalProps {
  open: boolean;
  onClose: () => void;
  character: Character | null;
  onChat: () => void;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  open,
  onClose,
  character,
  onChat,
  isAuthenticated,
  onLogin,
}) => {
  if (!character) return null;

  const hasNsfw = (character.tags ?? []).some((t: string) =>
    ['nsfw', 'limitless'].includes(t.toLowerCase())
  );

  return (
    <Modal isOpen={open} onClose={onClose} title="" size="lg">
      <div className="flex flex-col gap-5">
        {/* Header with avatar */}
        <div className="flex items-start gap-4">
          {character.avatar_url ? (
            <img
              src={character.avatar_url}
              alt={character.name}
              className="w-20 h-20 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-700 to-amber-600 flex items-center justify-center shrink-0 text-2xl font-bold text-white">
              {character.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-white">{character.name}</h2>
                {character.tagline && (
                  <p className="text-sm text-gray-400 mt-0.5">{character.tagline}</p>
                )}
              </div>
              <ShareButton character={character} />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-2">
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
                .map((tag: string) => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {character.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-1.5">About</h3>
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
              {character.description}
            </p>
          </div>
        )}

        {/* Greeting preview */}
        {character.greeting && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-1.5">Greeting</h3>
            <div className="bg-gray-800/50 rounded-lg px-3.5 py-2.5 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap border border-white/5">
              {character.greeting}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {character.chat_count > 0 && (
            <span>💬 {character.chat_count} chats</span>
          )}
          <span>📅 {new Date(character.created_at).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          {isAuthenticated ? (
            <Button size="lg" onClick={onChat}>
              Start Chatting
            </Button>
          ) : (
            <Button size="lg" onClick={onLogin}>
              Sign in to Chat
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
