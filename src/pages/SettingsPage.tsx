import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { getErrorMessage } from '../api/client';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import type { ApiKeyCreated } from '../types';

// ─── Profile section ─────────────────────────────────────────────────────────

function ProfileSection() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => authApi.updateMe({ name, username }),
    onSuccess: (res) => {
      setUser(res.data);
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setSuccess(false);
    },
  });

  return (
    <Card>
      <CardHeader title="Profile" subtitle="Update your display name and username." />
      <form
        className="flex flex-col gap-4 max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <Input
          label="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
        />
        {error && (
          <p className="text-sm text-red-400" role="alert">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-400">Profile updated.</p>
        )}
        <div>
          <Button type="submit" loading={mutation.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ─── Change password section ──────────────────────────────────────────────────

function PasswordSection() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword(current, next),
    onSuccess: () => {
      setCurrent('');
      setNext('');
      setConfirm('');
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    mutation.mutate();
  };

  return (
    <Card>
      <CardHeader title="Change Password" subtitle="Use a strong, unique password." />
      <form className="flex flex-col gap-4 max-w-sm" onSubmit={handleSubmit}>
        <Input
          label="Current password"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          required
        />
        <Input
          label="New password"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />
        {error && (
          <p className="text-sm text-red-400" role="alert">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-400">Password updated successfully.</p>
        )}
        <div>
          <Button type="submit" loading={mutation.isPending}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ─── API tokens section ───────────────────────────────────────────────────────

function ApiTokensSection() {
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: keys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => authApi.listApiKeys().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => authApi.createApiKey(newKeyName.trim()),
    onSuccess: (res) => {
      setCreatedKey(res.data);
      setNewKeyName('');
      setCreateError(null);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: (err) => {
      setCreateError(getErrorMessage(err));
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => authApi.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreatedKey(null);
    createMutation.mutate();
  };

  return (
    <Card>
      <CardHeader
        title="API Tokens"
        subtitle="Generate keys to use Mythic AI from SillyTavern or any OpenAI-compatible client."
      />

      {/* Create new key */}
      <form className="flex gap-3 mb-6 max-w-md" onSubmit={handleCreate}>
        <Input
          placeholder="Token name (e.g. SillyTavern)"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          className="flex-1"
        />
        <Button
          type="submit"
          loading={createMutation.isPending}
          disabled={!newKeyName.trim()}
        >
          Create
        </Button>
      </form>

      {createError && (
        <p className="text-sm text-red-400 mb-4" role="alert">{createError}</p>
      )}

      {/* Show newly created key once */}
      {createdKey && (
        <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/30 p-4">
          <p className="text-sm font-medium text-green-400 mb-1">
            Token created — copy it now, it won't be shown again.
          </p>
          <code className="block break-all text-xs font-mono text-green-300 select-all">
            {createdKey.key}
          </code>
          <p className="text-xs text-gray-400 mt-2">
            Use this as your API key in SillyTavern. Point the endpoint at{' '}
            <code className="text-gray-300">{'<host>/api/v1'}</code>.
          </p>
        </div>
      )}

      {/* Keys list */}
      {isLoading && <Spinner />}
      {!isLoading && keys && keys.length === 0 && (
        <p className="text-sm text-gray-500">No API tokens yet.</p>
      )}
      {!isLoading && keys && keys.length > 0 && (
        <ul className="flex flex-col gap-2" role="list">
          {keys.map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between gap-4 py-2.5 px-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{k.name}</p>
                <p className="text-xs text-gray-500">
                  {k.prefix ? <code>{k.prefix}…</code> : null}
                  {k.last_used_at
                    ? ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`
                    : ' · Never used'}
                  {' · '}
                  {k.request_count} requests
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 shrink-0"
                onClick={() => revokeMutation.mutate(k.id)}
                loading={revokeMutation.isPending && revokeMutation.variables === k.id}
                aria-label={`Revoke ${k.name}`}
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ─── Connected accounts section ───────────────────────────────────────────────

interface LinkedAccountRowProps {
  label: string;
  description: string;
  linked: boolean;
  onLink: () => void;
  onUnlink: () => void;
  linking: boolean;
  unlinking: boolean;
}

function LinkedAccountRow({
  label,
  description,
  linked,
  onLink,
  onUnlink,
  linking,
  unlinking,
}: LinkedAccountRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/10 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">
        {linked ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-400 font-medium">Connected</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
              onClick={onUnlink}
              loading={unlinking}
            >
              Unlink
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={onLink} loading={linking}>
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}

function LinkedAccountsSection() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Handle OAuth redirect result (linked=discord / error=... in URL params)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linked = params.get('linked');
    const oauthError = params.get('error');
    if (linked || oauthError) {
      // Clear query params from URL without navigating
      window.history.replaceState({}, '', window.location.pathname);
      if (linked) {
        // Refresh user to pick up new discord_id / patreon_id etc.
        authApi.me().then((res) => setUser(res.data)).catch(() => {});
      }
      if (oauthError) {
        const messages: Record<string, string> = {
          discord_already_linked: 'That Discord account is already linked to another Mythic AI account.',
          patreon_already_linked: 'That Patreon account is already linked to another Mythic AI account.',
          subscribestar_already_linked: 'That SubscribeStar account is already linked to another Mythic AI account.',
          discord_token_failed: 'Discord authorisation failed. Please try again.',
          patreon_token_failed: 'Patreon authorisation failed. Please try again.',
          subscribestar_token_failed: 'SubscribeStar authorisation failed. Please try again.',
        };
        setError(messages[oauthError] ?? `OAuth error: ${oauthError}`);
      }
    }
  }, [setUser]);

  const startOAuth = async (initiate: () => Promise<{ data: { redirect_url: string } }>) => {
    try {
      const res = await initiate();
      window.location.href = res.data.redirect_url;
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const unlinkMutation = (unlinkFn: () => Promise<unknown>) =>
    useMutation({
      mutationFn: unlinkFn,
      onSuccess: () => {
        authApi.me().then((res) => setUser(res.data)).catch(() => {});
        queryClient.invalidateQueries({ queryKey: ['me'] });
      },
      onError: (err) => setError(getErrorMessage(err)),
    });

  const discordUnlink = unlinkMutation(authApi.discordUnlink);
  const patreonUnlink = unlinkMutation(authApi.patreonUnlink);
  const subscribestarUnlink = unlinkMutation(authApi.subscribestarUnlink);

  return (
    <Card>
      <CardHeader
        title="Connected Accounts"
        subtitle="Link your social accounts to sync your subscription tier automatically."
      />
      {error && (
        <p className="text-sm text-red-400 mb-4" role="alert">{error}</p>
      )}
      <div>
        <LinkedAccountRow
          label="Discord"
          description="Use /chat, /status, and /link commands in Discord servers."
          linked={!!user?.discord_id}
          onLink={() => startOAuth(authApi.discordInitiate)}
          onUnlink={() => discordUnlink.mutate()}
          linking={false}
          unlinking={discordUnlink.isPending}
        />
        <LinkedAccountRow
          label="Patreon"
          description="Automatically sync your Gryphon or Dragon tier from your Patreon pledge."
          linked={!!user?.patreon_id}
          onLink={() => startOAuth(authApi.patreonInitiate)}
          onUnlink={() => patreonUnlink.mutate()}
          linking={false}
          unlinking={patreonUnlink.isPending}
        />
        <LinkedAccountRow
          label="SubscribeStar"
          description="Automatically sync your tier from your SubscribeStar subscription."
          linked={!!user?.subscribestar_id}
          onLink={() => startOAuth(authApi.subscribestarInitiate)}
          onUnlink={() => subscribestarUnlink.mutate()}
          linking={false}
          unlinking={subscribestarUnlink.isPending}
        />
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const SettingsPage: React.FC = () => (
  <div className="space-y-6 max-w-2xl">
    <div>
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <p className="text-gray-400 mt-1 text-sm">Manage your profile, security, and API access.</p>
    </div>
    <ProfileSection />
    <PasswordSection />
    <ApiTokensSection />
    <LinkedAccountsSection />
  </div>
);
