import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personasApi } from '../api/personas';
import { getErrorMessage } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import type { Persona, PersonaCreate } from '../types';

// ─── Create / Edit modal ─────────────────────────────────────────────────────

function PersonaFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PersonaCreate) => void;
  initial?: Persona | null;
  loading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [personality, setPersonality] = useState(initial?.personality ?? '');
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatar_url ?? '');

  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setDescription(initial?.description ?? '');
      setPersonality(initial?.personality ?? '');
      setAvatarUrl(initial?.avatar_url ?? '');
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      personality: personality || undefined,
      avatar_url: avatarUrl || undefined,
    });
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={initial ? 'Edit Persona' : 'Create Persona'} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
        <Input label="Name" placeholder="e.g. Raven Darkholme" value={name} onChange={(e) => setName(e.target.value)} required />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">Description</label>
          <textarea
            className="w-full rounded-lg bg-white/5 border border-white/10 hover:border-white/20 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors duration-150 min-h-[60px]"
            placeholder="A short description of who your persona is — the AI characters will see this."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">Personality</label>
          <textarea
            className="w-full rounded-lg bg-white/5 border border-white/10 hover:border-white/20 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors duration-150 min-h-[100px]"
            placeholder="Describe how your persona speaks and behaves. This is appended to the AI character's system prompt."
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-gray-500">AI characters will be told they are speaking to your persona. You can describe mannerisms, speech patterns, background, etc.</p>
        </div>

        <Input label="Avatar URL" placeholder="https://..." value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{initial ? 'Save Changes' : 'Create Persona'}</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── PersonaCard ─────────────────────────────────────────────────────────────

function PersonaCard({
  persona,
  onEdit,
  onDelete,
}: {
  persona: Persona;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex flex-col gap-2 hover:border-white/20 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white truncate group-hover:text-red-300 transition-colors">
          {persona.name}
        </h3>
      </div>
      {persona.description && (
        <p className="text-sm text-gray-400 line-clamp-2">{persona.description}</p>
      )}
      {persona.personality && (
        <p className="text-xs text-gray-500 line-clamp-2 italic">{persona.personality}</p>
      )}
      <div className="flex justify-end gap-2 pt-2 border-t border-white/10 mt-auto">
        <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </Card>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export const PersonasPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Persona | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Persona | null>(null);

  const { data: personas, isLoading, error } = useQuery({
    queryKey: ['personas'],
    queryFn: () => personasApi.mine().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data: PersonaCreate) => personasApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      setFormOpen(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PersonaCreate }) =>
      personasApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      setEditing(null);
      setFormOpen(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => personasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      setDeleteTarget(null);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Personas</h1>
          <p className="text-gray-400 text-sm mt-1">Create personas to represent yourself when chatting with AI characters</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Persona
        </Button>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
          {getErrorMessage(error)}
        </div>
      )}

      {!isLoading && !error && personas && personas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">
            You haven't created any personas yet. Click "New Persona" to create one!
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Personas let AI characters know who they're speaking to — give yourself a name, backstory, and personality.
          </p>
        </div>
      )}

      {!isLoading && personas && personas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {personas.map((p) => (
            <PersonaCard
              key={p.id}
              persona={p}
              onEdit={() => { setEditing(p); setFormOpen(true); }}
              onDelete={() => setDeleteTarget(p)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <PersonaFormModal
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

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Persona">
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
