// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export type Tier = 'free' | 'plus' | 'pro';

export type Role = 'user' | 'admin' | 'service' | 'support' | 'moderator' | 'editor';

export const TIER_LABELS: Record<Tier, string> = {
  free: 'Kobold',
  plus: 'Gryphon',
  pro: 'Dragon',
};

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  role: Role;
  tier: Tier;
  is_active: boolean;
  is_verified?: boolean;
  created_at: string;
  updated_at?: string;
  // Linked social accounts (null = not linked)
  discord_id: string | null;
  patreon_id: string | null;
  subscribestar_id: string | null;
}

// ─── API Keys ────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  prefix?: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  request_count: number;
}

export interface ApiKeyCreated extends ApiKey {
  key: string; // shown once on creation only
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
  lora_adapter?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string | null;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatChoice[];
}

// ─── Demos ───────────────────────────────────────────────────────────────────

export interface DemoLoRA {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  rating_count: number;
  model_id?: string;
  is_featured: boolean;
  created_at: string;
}

export interface DemoRating {
  rating: number;
  comment?: string;
}

// ─── Characters ──────────────────────────────────────────────────────────────

export type CharacterVisibility = 'private' | 'public' | 'unlisted';

export interface Character {
  id: string;
  user_id: string;
  name: string;
  tagline?: string;
  description?: string;
  personality: string;
  greeting?: string;
  example_messages?: { role: string; content: string }[];
  category?: string;
  tags: string[];
  avatar_url?: string;
  visibility: CharacterVisibility;
  context_window: number;
  chat_count: number;
  created_at: string;
  updated_at: string;
}

export interface CharacterCreate {
  name: string;
  tagline?: string;
  description?: string;
  personality: string;
  greeting?: string;
  example_messages?: { role: string; content: string }[];
  category?: string;
  tags?: string[];
  avatar_url?: string;
  visibility?: CharacterVisibility;
  context_window?: number;
}

export interface CharacterUpdate extends Partial<CharacterCreate> {}

// ─── Training ────────────────────────────────────────────────────────────────

export type TrainingStatus =
  | 'pending'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface TrainingJob {
  id: string;
  user_id: string;
  status: TrainingStatus;
  model_name: string;
  adapter_name: string;
  progress: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
  config?: Record<string, unknown>;
  queue_position?: number;
  estimated_wait_seconds?: number;
}

export interface TrainingPreset {
  name: string;
  description: string;
  epochs: number;
  learning_rate: number;
  batch_size: number;
  lora_r: number;
  lora_alpha: number;
  lora_dropout: number;
}

export interface TrainingConfig {
  adapter_name: string;
  model_name: string;
  epochs: number;
  learning_rate: number;
  batch_size: number;
  lora_r: number;
  lora_alpha: number;
  lora_dropout: number;
}

// ─── Conversations ───────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  lora_adapter?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  user_id: string;
  tier: Tier;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export interface TierFeatures {
  name: string;
  price: number;
  features: string[];
  limits: {
    monthly_training_jobs: number;
    max_adapters: number;
    chat_requests_per_day: number;
  };
}

// ─── Webhooks ────────────────────────────────────────────────────────────────

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string | { msg: string; type: string }[];
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  tier: string;
  is_verified: boolean;
  is_active: boolean;
  stripe_customer_id?: string;
  created_at?: string;
  subscription?: {
    id: string;
    tier: string;
    status: string;
    is_active: boolean;
  } | null;
}

export interface AdminStats {
  users: {
    total: number;
    verified: number;
    by_tier: Record<string, number>;
  };
  training_jobs: {
    total: number;
    completed: number;
    failed: number;
    active: number;
    success_rate: number;
  };
  conversations: { total: number };
  models: { total_active: number };
  subscriptions: { active: number };
}

export interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  admin_email?: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface PaginatedUsers {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaginatedAuditLog {
  entries: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
}
