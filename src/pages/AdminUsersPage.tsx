import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import { getErrorMessage } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { TIER_LABELS } from '../types';
import type { AdminUser, Tier } from '../types';

const ROLES = ['user', 'admin', 'support', 'moderator', 'editor'] as const;
const TIERS = ['free', 'plus', 'pro'] as const;

const ROLE_BADGE: Record<string, 'default' | 'purple' | 'info' | 'warning' | 'danger'> = {
  user: 'default',
  admin: 'purple',
  support: 'info',
  moderator: 'warning',
  editor: 'info',
  service: 'danger',
};

const TIER_BADGE: Record<string, 'default' | 'purple' | 'success' | 'info'> = {
  free: 'default',
  plus: 'info',
  pro: 'purple',
};

// ---------------------------------------------------------------------------
// Edit Modal
// ---------------------------------------------------------------------------

function EditUserModal({
  user,
  isOpen,
  onClose,
}: {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [role, setRole] = useState(user?.role ?? 'user');
  const [tier, setTier] = useState(user?.tier ?? 'free');
  const [active, setActive] = useState(user?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setRole(user.role);
      setTier(user.tier);
      setActive(user.is_active);
      setError(null);
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.updateUser(user!.id, { role, tier, is_active: active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${user.email}`}>
      <div className="space-y-4">
        {/* Role */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            {ROLES.map((r) => (
              <option key={r} value={r} className="bg-gray-900">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Tier */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">Tier</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            {TIERS.map((t) => (
              <option key={t} value={t} className="bg-gray-900">
                {TIER_LABELS[t as Tier]}
              </option>
            ))}
          </select>
        </div>

        {/* Active toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-red-700 focus:ring-red-600"
          />
          <span className="text-sm text-gray-300">Account active</span>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
          Save
        </Button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Reset Password Modal
// ---------------------------------------------------------------------------

function ResetPasswordModal({
  user,
  isOpen,
  onClose,
}: {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tempPw, setTempPw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setTempPw(null);
    setError(null);
  }, [user, isOpen]);

  const mutation = useMutation({
    mutationFn: () => adminApi.resetPassword(user!.id),
    onSuccess: (res) => setTempPw(res.data.temporary_password),
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reset password — ${user.email}`} size="sm">
      {tempPw ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">Temporary password generated:</p>
          <code className="block bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-green-400 font-mono select-all break-all">
            {tempPw}
          </code>
          <p className="text-xs text-gray-500">
            Share this with the user. They should change it immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            This will generate a new temporary password for <strong className="text-white">{user.email}</strong>.
          </p>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          {tempPw ? 'Done' : 'Cancel'}
        </Button>
        {!tempPw && (
          <Button variant="danger" onClick={() => mutation.mutate()} loading={mutation.isPending}>
            Reset Password
          </Button>
        )}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Users Page
// ---------------------------------------------------------------------------

export const AdminUsersPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const pageSize = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, page }],
    queryFn: () =>
      adminApi
        .listUsers({
          limit: pageSize,
          offset: page * pageSize,
          search: search || undefined,
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-gray-400 text-sm mt-1">{total} total users</p>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search by email or name…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && !users.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white font-medium truncate max-w-[200px]">{u.email}</td>
                    <td className="px-4 py-3 text-gray-400 truncate max-w-[150px]">{u.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_BADGE[u.role] ?? 'default'}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={TIER_BADGE[u.tier] ?? 'default'}>
                        {TIER_LABELS[u.tier as Tier] ?? u.tier}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Disabled</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditUser(u)}
                          aria-label={`Edit ${u.email}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setResetUser(u)}
                          aria-label={`Reset password for ${u.email}`}
                        >
                          Reset PW
                        </Button>
                        {u.is_active && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Deactivate ${u.email}? This will revoke all API keys.`)) {
                                deactivate.mutate(u.id);
                              }
                            }}
                            aria-label={`Deactivate ${u.email}`}
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditUserModal user={editUser} isOpen={!!editUser} onClose={() => setEditUser(null)} />
      <ResetPasswordModal user={resetUser} isOpen={!!resetUser} onClose={() => setResetUser(null)} />
    </div>
  );
};
