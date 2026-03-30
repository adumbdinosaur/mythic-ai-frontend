import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingApi } from '../api/training';
import { getErrorMessage } from '../api/client';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import type { TrainingStatus, TrainingJob } from '../types';

const statusVariant: Record<TrainingStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  completed: 'success',
  running: 'info',
  queued: 'warning',
  pending: 'default',
  failed: 'danger',
  cancelled: 'default',
};

function formatDate(s: string) {
  return new Date(s).toLocaleString();
}

function formatSeconds(s: number) {
  if (s < 60) return `~${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `~${m}m`;
  const h = Math.floor(m / 60);
  return `~${h}h ${m % 60}m`;
}

function QueueStatusPanel({ job }: { job: TrainingJob }) {
  const { data: queueData } = useQuery({
    queryKey: ['queue-position', job.id],
    queryFn: () => trainingApi.queuePosition(job.id).then((r) => r.data),
    enabled: job.status === 'queued' || job.status === 'pending',
    refetchInterval: 15_000,
  });

  if (job.status !== 'queued' && job.status !== 'pending') return null;

  return (
    <Card>
      <CardHeader title="Queue Status" />
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs text-gray-500">Position</p>
          <p className="text-2xl font-bold text-white">
            {queueData ? `#${queueData.queue_position}` : <Spinner size="sm" />}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Estimated wait</p>
          <p className="text-2xl font-bold text-white">
            {queueData ? formatSeconds(queueData.estimated_wait_seconds) : '—'}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Updates every 15 seconds while queued.
      </p>
    </Card>
  );
}

export const TrainingJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['training-job', id],
    queryFn: () => trainingApi.getJob(id!).then((r) => r.data),
    enabled: !!id,
    // Poll while running or queued
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'running' || status === 'queued' || status === 'pending') return 5_000;
      return false;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => trainingApi.cancelJob(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['training-job', id] });
      void queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
    },
  });

  // When job completes, invalidate jobs list
  useEffect(() => {
    if (job?.status === 'completed' || job?.status === 'failed') {
      void queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
    }
  }, [job?.status, queryClient]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading job details" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400">{error ? getErrorMessage(error) : 'Job not found.'}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/training')}>
          Back to Training
        </Button>
      </div>
    );
  }

  const isActive = job.status === 'running' || job.status === 'queued' || job.status === 'pending';

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          to="/training"
          className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 text-sm text-gray-400 hover:text-white hover:bg-white/5 px-3 py-1.5"
          aria-label="Back to training"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-white">{job.adapter_name}</h1>
        <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
      </div>

      {/* Queue Status */}
      <QueueStatusPanel job={job} />

      {/* Progress */}
      {job.status === 'running' && (
        <Card>
          <CardHeader title="Training Progress" />
          <div className="flex items-center gap-4">
            <div
              className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={job.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Training progress: ${job.progress}%`}
            >
              <div
                className="h-full bg-gradient-to-r from-red-600 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white w-12 text-right">{job.progress}%</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Refreshes every 5 seconds.
          </p>
        </Card>
      )}

      {/* Success */}
      {job.status === 'completed' && (
        <Card className="border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xl" aria-hidden="true">
              ✓
            </div>
            <div>
              <p className="font-semibold text-white">Training complete!</p>
              <p className="text-sm text-gray-400">Your adapter is ready to use in Chat.</p>
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() => navigate('/chat')}
            aria-label="Start chatting with this adapter"
          >
            Start chatting
          </Button>
        </Card>
      )}

      {/* Error */}
      {job.status === 'failed' && (
        <Card className="border-red-500/30 bg-red-500/5">
          <p className="font-semibold text-red-400">Training failed</p>
          {job.error_message && (
            <p className="mt-1 text-sm text-gray-400 font-mono bg-white/5 rounded p-3 mt-2">
              {job.error_message}
            </p>
          )}
        </Card>
      )}

      {/* Job Details */}
      <Card>
        <CardHeader title="Job Details" />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['ID', job.id],
            ['Base model', job.model_name],
            ['Created', formatDate(job.created_at)],
            ['Updated', formatDate(job.updated_at)],
            ...(job.completed_at ? [['Completed', formatDate(job.completed_at)]] : []),
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-gray-500 text-xs">{label}</dt>
              <dd className="text-white break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Actions */}
      {isActive && (
        <Button
          variant="danger"
          onClick={() => cancelMutation.mutate()}
          loading={cancelMutation.isPending}
          disabled={cancelMutation.isSuccess}
        >
          Cancel job
        </Button>
      )}
    </div>
  );
};
