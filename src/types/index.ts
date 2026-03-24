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

export type Tier = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  username: string;
  tier: Tier;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
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
