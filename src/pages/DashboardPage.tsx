import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { trainingApi } from '../api/training';
import { subscriptionsApi } from '../api/subscriptions';
import { conversationsApi } from '../api/conversations';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import type { TrainingStatus } from '../types';

const statusVariant: Record<TrainingStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  completed: 'success',
  running: 'info',
  queued: 'warning',
  pending: 'default',
  failed: 'danger',
  cancelled: 'default',
};

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

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['training-jobs'],
    queryFn: () => trainingApi.listJobs().then((r) => r.data),
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionsApi.me().then((r) => r.data),
    retry: false, // users without subscription will get 404
  });

  const { data: conversations } = useQuery({
    queryKey: ['conversations-count'],
    queryFn: () => conversationsApi.list({ limit: 1 }).then((r) => r.data),
  });

  const activeJobs = jobs?.filter((j) => j.status === 'running' || j.status === 'queued') ?? [];
  const completedJobs = jobs?.filter((j) => j.status === 'completed') ?? [];

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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Plan"
          value={
            <span className="capitalize">{subscription?.tier ?? user?.tier ?? 'free'}</span>
          }
          sub={subscription?.status === 'active' ? 'Active' : undefined}
        />
        <StatCard
          label="Training jobs"
          value={jobsLoading ? <Spinner size="sm" /> : (jobs?.length ?? 0)}
          sub={`${completedJobs.length} completed`}
        />
        <StatCard
          label="Active jobs"
          value={jobsLoading ? <Spinner size="sm" /> : activeJobs.length}
          sub="running or queued"
        />
        <StatCard
          label="Conversations"
          value={subLoading ? <Spinner size="sm" /> : (conversations?.length ?? '—')}
          sub="saved"
        />
      </div>

      {/* Recent training jobs */}
      <Card>
        <CardHeader
          title="Recent Training Jobs"
          action={
            <Link
              to="/training"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none px-4 py-2 text-sm bg-transparent hover:bg-white/5 text-gray-200 border border-white/20 cursor-pointer"
            >
              New job
            </Link>
          }
        />
        {jobsLoading && (
          <div className="flex justify-center py-6">
            <Spinner label="Loading jobs" />
          </div>
        )}
        {!jobsLoading && (!jobs || jobs.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No training jobs yet.</p>
            <Link to="/training" className="mt-2 text-purple-400 hover:underline text-sm">
              Start your first job →
            </Link>
          </div>
        )}
        {jobs && jobs.length > 0 && (
          <ul className="divide-y divide-white/5" role="list" aria-label="Training jobs">
            {jobs.slice(0, 5).map((job) => (
              <li key={job.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{job.adapter_name}</p>
                  <p className="text-xs text-gray-500">{job.model_name}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {job.status === 'running' && (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 w-20 bg-white/10 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={job.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${job.adapter_name} progress`}
                      >
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{job.progress}%</span>
                    </div>
                  )}
                  <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/chat"
          className="block rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/20 p-5 hover:border-purple-500/40 transition-colors"
          aria-label="Go to Chat"
        >
          <h3 className="font-semibold text-white">Start chatting</h3>
          <p className="mt-1 text-sm text-gray-400">Use any of your fine-tuned adapters.</p>
        </Link>
        <Link
          to="/demos"
          className="block rounded-xl bg-gradient-to-br from-pink-600/20 to-pink-600/5 border border-pink-500/20 p-5 hover:border-pink-500/40 transition-colors"
          aria-label="Browse demo models"
        >
          <h3 className="font-semibold text-white">Browse demos</h3>
          <p className="mt-1 text-sm text-gray-400">Try community-shared LoRA adapters.</p>
        </Link>
        <Link
          to="/training"
          className="block rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/20 p-5 hover:border-blue-500/40 transition-colors"
          aria-label="Start a training job"
        >
          <h3 className="font-semibold text-white">Train a model</h3>
          <p className="mt-1 text-sm text-gray-400">Upload data and fine-tune with LoRA.</p>
        </Link>
      </div>
    </div>
  );
};
