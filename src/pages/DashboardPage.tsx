import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { subscriptionsApi } from '../api/subscriptions';
import { conversationsApi } from '../api/conversations';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { TIER_LABELS } from '../types';

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

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionsApi.me().then((r) => r.data),
    retry: false, // users without subscription will get 404
  });

  const { data: conversations } = useQuery({
    queryKey: ['conversations-count'],
    queryFn: () => conversationsApi.list({ limit: 1 }).then((r) => r.data),
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
            <span>{TIER_LABELS[subscription?.tier ?? user?.tier ?? 'free']}</span>
          }
          sub={subscription?.status === 'active' ? 'Active' : undefined}
        />
        <StatCard
          label="Context window"
          value={
            (() => {
              const t = subscription?.tier ?? user?.tier ?? 'free';
              const map: Record<string, string> = { free: '4k', plus: '8k', pro: '16k' };
              return map[t] ?? '4k';
            })()
          }
          sub="token limit"
        />
        <StatCard
          label="Conversations"
          value={subLoading ? <Spinner size="sm" /> : (conversations?.length ?? '—')}
          sub="saved"
        />
      </div>

      {/* Training panel hidden — re-enable when TRAINING_ENABLED=true */}

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/chat"
          className="block rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/20 p-5 hover:border-purple-500/40 transition-colors"
          aria-label="Go to Chat"
        >
          <h3 className="font-semibold text-white">Start chatting</h3>
          <p className="mt-1 text-sm text-gray-400">Jump in and start a conversation.</p>
        </Link>
        <Link
          to="/demos"
          className="block rounded-xl bg-gradient-to-br from-pink-600/20 to-pink-600/5 border border-pink-500/20 p-5 hover:border-pink-500/40 transition-colors"
          aria-label="Browse demo models"
        >
          <h3 className="font-semibold text-white">Browse demos</h3>
          <p className="mt-1 text-sm text-gray-400">Try our curated demo models.</p>
        </Link>
      </div>
    </div>
  );
};
