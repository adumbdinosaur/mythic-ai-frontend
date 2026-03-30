import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

const ACTION_LABELS: Record<string, string> = {
  'user.update': 'User updated',
  'user.deactivate': 'User deactivated',
  'user.reactivate': 'User reactivated',
  'user.password_reset': 'Password reset',
  'apikey.revoke': 'API key revoked',
  'adapter.delete': 'Adapter deleted',
  'conversation.delete': 'Conversation deleted',
  'job.cancel': 'Job cancelled',
};

const ACTION_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
  'user.update': 'info',
  'user.deactivate': 'danger',
  'user.reactivate': 'success',
  'user.password_reset': 'warning',
  'apikey.revoke': 'danger',
  'adapter.delete': 'danger',
  'conversation.delete': 'warning',
  'job.cancel': 'warning',
};

export const AdminAuditLogPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const pageSize = 50;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-log', { page, actionFilter }],
    queryFn: () =>
      adminApi
        .auditLog({
          limit: pageSize,
          offset: page * pageSize,
          action: actionFilter || undefined,
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-gray-400 text-sm mt-1">{total} total entries</p>
      </div>

      {/* Filter */}
      <div className="max-w-xs">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(0);
          }}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="" className="bg-gray-900">All actions</option>
          {Object.entries(ACTION_LABELS).map(([val, label]) => (
            <option key={val} value={val} className="bg-gray-900">
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Log table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && !entries.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No audit log entries.
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {e.created_at ? new Date(e.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ACTION_VARIANT[e.action] ?? 'default'}>
                        {ACTION_LABELS[e.action] ?? e.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400 text-xs">{e.target_type}</span>
                      <span className="ml-1 text-gray-500 text-xs font-mono">{e.target_id.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono truncate max-w-[120px]">
                      {e.admin_email ?? e.admin_user_id.slice(0, 8) + '…'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                      {e.ip_address ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[200px]">
                      {e.details ? JSON.stringify(e.details) : '—'}
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
    </div>
  );
};
