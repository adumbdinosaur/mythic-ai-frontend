import { api } from './client';
import type { Subscription } from '../types';

export interface CheckoutSession {
  checkout_url: string;
}

export const subscriptionsApi = {
  me: () => api.get<Subscription>('/api/v1/subscriptions/me'),

  createCheckout: (tier: string) =>
    api.post<CheckoutSession>('/api/v1/subscriptions/checkout', { tier }),

  cancelSubscription: () => api.post('/api/v1/subscriptions/cancel'),

  billingPortal: () =>
    api.post<{ portal_url: string }>('/api/v1/subscriptions/billing-portal'),
};
