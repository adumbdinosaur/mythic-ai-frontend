import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { trainingApi } from '../api/training';
import { getErrorMessage } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import type { TrainingPreset, TrainingConfig, TrainingStatus } from '../types';

const statusBadge: Record<TrainingStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  completed: 'success',
  running: 'info',
  queued: 'warning',
  pending: 'default',
  failed: 'danger',
  cancelled: 'default',
};

const BASE_MODELS = [
  'meta-llama/Llama-2-7b-chat-hf',
  'meta-llama/Llama-2-13b-chat-hf',
  'mistralai/Mistral-7B-Instruct-v0.2',
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export const TrainingPage: React.FC = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<TrainingPreset | null>(null);
  const [config, setConfig] = useState<TrainingConfig>({
    adapter_name: '',
    model_name: BASE_MODELS[0],
    epochs: 3,
    learning_rate: 2e-4,
    batch_size: 4,
    lora_r: 16,
    lora_alpha: 32,
    lora_dropout: 0.05,
  });
  const [submitError, setSubmitError] = useState('');

  const { data: presets, isLoading: presetsLoading } = useQuery({
    queryKey: ['training-presets'],
    queryFn: () => trainingApi.presets().then((r) => r.data),
  });

  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['training-jobs'],
    queryFn: () => trainingApi.listJobs().then((r) => r.data),
    refetchInterval: 10_000,
  });

  const submitMutation = useMutation({
    mutationFn: () => trainingApi.submitJob(config, file ?? undefined),
    onSuccess: (res) => {
      void refetchJobs();
      navigate(`/training/${res.data.id}`);
    },
    onError: (err) => setSubmitError(getErrorMessage(err)),
  });

  const applyPreset = (preset: TrainingPreset) => {
    setSelectedPreset(preset);
    setConfig((c) => ({
      ...c,
      epochs: preset.epochs,
      learning_rate: preset.learning_rate,
      batch_size: preset.batch_size,
      lora_r: preset.lora_r,
      lora_alpha: preset.lora_alpha,
      lora_dropout: preset.lora_dropout,
    }));
  };

  const setField = (field: keyof TrainingConfig) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setConfig((c) => ({ ...c, [field]: value }));
    setSelectedPreset(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    submitMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Training</h1>
        <p className="text-gray-400 mt-1 text-sm">Fine-tune a model with LoRA on your data.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5" aria-label="Training job configuration">
          {/* Presets */}
          <Card>
            <CardHeader title="Quick Presets" subtitle="Pick a preset to auto-fill settings" />
            {presetsLoading ? (
              <Spinner size="sm" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {(presets ?? []).map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    aria-pressed={selectedPreset?.name === p.name}
                    className={[
                      'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                      selectedPreset?.name === p.name
                        ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white',
                    ].join(' ')}
                  >
                    {p.name}
                  </button>
                ))}
                {(!presets || presets.length === 0) && (
                  <p className="text-sm text-gray-500">No presets available.</p>
                )}
              </div>
            )}
            {selectedPreset && (
              <p className="mt-2 text-xs text-gray-500">{selectedPreset.description}</p>
            )}
          </Card>

          {/* Config */}
          <Card>
            <CardHeader title="Configuration" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Adapter name"
                value={config.adapter_name}
                onChange={setField('adapter_name')}
                required
                placeholder="my-cool-adapter"
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="model-select" className="text-sm font-medium text-gray-300">
                  Base model
                </label>
                <select
                  id="model-select"
                  value={config.model_name}
                  onChange={setField('model_name')}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {BASE_MODELS.map((m) => (
                    <option key={m} value={m}>{m.split('/').pop()}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Epochs"
                type="number"
                min={1}
                max={20}
                value={config.epochs}
                onChange={setField('epochs')}
              />
              <Input
                label="Learning rate"
                type="number"
                step="0.00001"
                min={0.000001}
                max={0.01}
                value={config.learning_rate}
                onChange={setField('learning_rate')}
              />
              <Input
                label="Batch size"
                type="number"
                min={1}
                max={32}
                value={config.batch_size}
                onChange={setField('batch_size')}
              />
              <Input
                label="LoRA rank (r)"
                type="number"
                min={4}
                max={128}
                value={config.lora_r}
                onChange={setField('lora_r')}
              />
              <Input
                label="LoRA alpha"
                type="number"
                min={4}
                max={256}
                value={config.lora_alpha}
                onChange={setField('lora_alpha')}
              />
              <Input
                label="LoRA dropout"
                type="number"
                step="0.01"
                min={0}
                max={0.5}
                value={config.lora_dropout}
                onChange={setField('lora_dropout')}
              />
            </div>
          </Card>

          {/* File upload */}
          <Card>
            <CardHeader title="Training Data" subtitle="Upload a JSONL file with your training examples" />
            <div
              className={[
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                file ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10 hover:border-white/20',
              ].join(' ')}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".jsonl,.json,.txt,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="training-file"
                aria-label="Upload training data file"
              />
              {file ? (
                <div>
                  <p className="text-sm text-purple-300 font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="training-file"
                  className="cursor-pointer"
                >
                  <div className="text-gray-400 text-sm">
                    <span className="text-purple-400 hover:underline">Choose a file</span>
                    {' '}or drag and drop
                  </div>
                  <p className="text-xs text-gray-600 mt-1">JSONL, JSON, TXT, CSV</p>
                </label>
              )}
            </div>
          </Card>

          {submitError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2" role="alert">
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={submitMutation.isPending}
            disabled={!config.adapter_name}
          >
            Start training job
          </Button>
        </form>

        {/* Jobs sidebar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Recent Jobs" />
            {jobsLoading && <Spinner size="sm" />}
            {!jobsLoading && (!jobs || jobs.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No jobs yet.</p>
            )}
            {jobs && jobs.length > 0 && (
              <ul className="divide-y divide-white/5" role="list" aria-label="Training jobs">
                {jobs.slice(0, 8).map((job) => (
                  <li key={job.id} className="py-2.5">
                    <button
                      className="w-full text-left hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/training/${job.id}`)}
                      aria-label={`View job ${job.adapter_name}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-white truncate">{job.adapter_name}</p>
                        <Badge variant={statusBadge[job.status]}>{job.status}</Badge>
                      </div>
                      {job.status === 'running' && (
                        <div
                          className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={job.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      )}
                      {job.estimated_wait_seconds && job.status === 'queued' && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          ~{formatDuration(job.estimated_wait_seconds)} wait
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
