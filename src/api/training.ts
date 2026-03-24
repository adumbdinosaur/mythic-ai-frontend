import { api } from './client';
import type { TrainingJob, TrainingConfig, TrainingPreset } from '../types';

export const trainingApi = {
  /** List user's training jobs */
  listJobs: () => api.get<TrainingJob[]>('/api/v1/lora'),

  /** Get a single job */
  getJob: (id: string) => api.get<TrainingJob>(`/api/v1/lora/${id}`),

  /** Submit a new training job with optional file */
  submitJob: (config: TrainingConfig, file?: File) => {
    const form = new FormData();
    form.append('config', JSON.stringify(config));
    if (file) form.append('file', file);
    return api.post<TrainingJob>('/api/v1/lora/train', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Cancel a training job */
  cancelJob: (id: string) => api.post(`/api/v1/lora/${id}/cancel`),

  /** Get queue position for a job */
  queuePosition: (id: string) =>
    api.get<{ queue_position: number; estimated_wait_seconds: number }>(
      `/api/v1/train/${id}/queue-position`
    ),

  /** Get training presets */
  presets: () => api.get<TrainingPreset[]>('/api/v1/train/presets'),

  /** Get active training jobs (admin/system) */
  activeJobs: () => api.get<TrainingJob[]>('/api/v1/train/active'),

  /** List available base models */
  listAdapters: () => api.get<{ id: string; name: string }[]>('/api/v1/lora/adapters'),
};
