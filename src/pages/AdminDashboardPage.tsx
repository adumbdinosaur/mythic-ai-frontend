import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { TIER_LABELS } from '../types';
import type { Tier } from '../types';

function StatCard({
  label,
  value,
  sub,
  color = 'text-white',
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  color?: string;
}) {
  return (
    <Card>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </Card>
  );
}

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.stats().then((r) => r.data),
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">Failed to load admin stats.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Platform overview and key metrics.</p>
        </div>
      </div>

      {/* User stats */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Users</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total users" value={stats.users.total} />
          <StatCard label="Verified" value={stats.users.verified} color="text-green-400" />
          {(['free', 'plus', 'pro'] as const).map((t) => (
            <StatCard
              key={t}
              label={TIER_LABELS[t as Tier]}
              value={stats.users.by_tier[t] ?? 0}
              color={t === 'pro' ? 'text-red-400' : t === 'plus' ? 'text-amber-400' : 'text-gray-300'}
            />
          ))}
        </div>
      </div>

      {/* Training stats */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Training Jobs</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total jobs" value={stats.training_jobs.total} />
          <StatCard label="Completed" value={stats.training_jobs.completed} color="text-green-400" />
          <StatCard label="Failed" value={stats.training_jobs.failed} color="text-red-400" />
          <StatCard label="Active" value={stats.training_jobs.active} color="text-yellow-400" />
        </div>
      </div>

      {/* Other stats row */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Platform</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Conversations" value={stats.conversations.total} />
          <StatCard label="Active models" value={stats.models.total_active} />
          <StatCard label="Active subscriptions" value={stats.subscriptions.active} />
          <StatCard
            label="Training success"
            value={`${(stats.training_jobs.success_rate * 100).toFixed(1)}%`}
            color="text-green-400"
          />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/admin/users"
          className="block rounded-xl bg-gradient-to-br from-red-700/20 to-red-700/5 border border-red-600/20 p-5 hover:border-red-600/40 transition-colors"
        >
          <h3 className="font-semibold text-white">Manage Users</h3>
          <p className="mt-1 text-sm text-gray-400">
            {stats.users.total} registered users
          </p>
        </Link>
        <Link
          to="/admin/audit-log"
          className="block rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-pink-500/20 p-5 hover:border-pink-500/40 transition-colors"
        >
          <h3 className="font-semibold text-white">Audit Log</h3>
          <p className="mt-1 text-sm text-gray-400">Review admin actions.</p>
        </Link>
        <Link
          to="/settings"
          className="block rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/20 p-5 hover:border-blue-500/40 transition-colors"
        >
          <h3 className="font-semibold text-white">Settings</h3>
          <p className="mt-1 text-sm text-gray-400">Account & API keys.</p>
        </Link>
      </div>
    </div>
  );
};
