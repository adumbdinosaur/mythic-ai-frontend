import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { subscriptionsApi } from '../api/subscriptions';
import { getErrorMessage } from '../api/client';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import type { Tier, TierFeatures } from '../types';
import { TIER_LABELS } from '../types';

const TIER_DATA: Record<Tier, TierFeatures> = {
  free: {
    name: TIER_LABELS.free,
    price: 0,
    features: [
      '4k token context window',
      '5 messages / minute',
      'Community demos access',
      'Admitted when VIP lane is idle',
    ],
    limits: { monthly_training_jobs: 0, max_adapters: 0, chat_requests_per_day: -1 },
  },
  plus: {
    name: TIER_LABELS.plus,
    price: 5,
    features: [
      '8k token context window',
      '60 requests / minute',
      'VIP fast lane — no queue wait',
      'Full demos access',
      'Conversation history',
    ],
    limits: { monthly_training_jobs: 0, max_adapters: 0, chat_requests_per_day: -1 },
  },
  pro: {
    name: TIER_LABELS.pro,
    price: 15,
    features: [
      '16k token context window',
      '200 requests / minute',
      'VIP fast lane — highest priority',
      'Full demos access',
      'Conversation history',
      'API access (SillyTavern compatible)',
    ],
    limits: { monthly_training_jobs: 0, max_adapters: 0, chat_requests_per_day: -1 },
  },
};

function TierCard({
  tier,
  data,
  isCurrent,
  onUpgrade,
  loading,
}: {
  tier: Tier;
  data: TierFeatures;
  isCurrent: boolean;
  onUpgrade: () => void;
  loading: boolean;
}) {
  const highlighted = tier === 'plus';
  return (
    <div
      className={[
        'rounded-2xl border p-6 flex flex-col gap-4 transition-colors',
        highlighted
          ? 'border-purple-500 bg-purple-500/10'
          : isCurrent
          ? 'border-green-500/40 bg-green-500/5'
          : 'border-white/10 bg-white/5',
      ].join(' ')}
      aria-label={`${data.name} plan`}
    >
      {highlighted && (
        <Badge variant="purple" className="self-start">Most popular</Badge>
      )}

      <div>
        <h3 className="text-lg font-bold text-white">{data.name}</h3>
        <p className="mt-1">
          {data.price === 0 ? (
            <span className="text-2xl font-bold text-white">Free</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-white">${data.price}</span>
              <span className="text-gray-400 text-sm"> / month</span>
            </>
          )}
        </p>
      </div>

      <ul className="flex flex-col gap-2 flex-1" role="list" aria-label={`${data.name} features`}>
        {data.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-green-400 shrink-0 mt-0.5" aria-hidden="true">✓</span>
            {f}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <Badge variant="success" className="self-start py-1 px-3 text-sm">Current plan</Badge>
      ) : (
        <Button
          variant={highlighted ? 'primary' : 'outline'}
          onClick={onUpgrade}
          loading={loading}
          aria-label={`Upgrade to ${data.name}`}
        >
          {tier === 'free' ? 'Downgrade' : `Upgrade to ${data.name}`}
        </Button>
      )}
    </div>
  );
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export const SubscriptionPage: React.FC = () => {
  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionsApi.me().then((r) => r.data),
    retry: false,
  });

  const checkoutMutation = useMutation({
    mutationFn: (tier: string) => subscriptionsApi.createCheckout(tier),
    onSuccess: (res) => {
      window.location.href = res.data.checkout_url;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionsApi.cancelSubscription(),
  });

  const portalMutation = useMutation({
    mutationFn: () => subscriptionsApi.billingPortal(),
    onSuccess: (res) => {
      window.location.href = res.data.portal_url;
    },
  });

  const currentTier: Tier = subscription?.tier ?? 'free';

  const apiError =
    checkoutMutation.error
      ? getErrorMessage(checkoutMutation.error)
      : cancelMutation.error
      ? getErrorMessage(cancelMutation.error)
      : null;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        <p className="text-gray-400 mt-1 text-sm">Manage your plan and billing.</p>
      </div>

      {/* Current plan summary */}
      <Card>
        <CardHeader
          title="Current Plan"
          action={
            subscription && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => portalMutation.mutate()}
                loading={portalMutation.isPending}
              >
                Billing portal
              </Button>
            )
          }
        />
        {isLoading && <Spinner />}
        {!isLoading && (
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-xs text-gray-500">Plan</p>
              <p className="text-xl font-bold text-white">{TIER_LABELS[currentTier]}</p>
            </div>
            {subscription && (
              <>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge
                    variant={subscription.status === 'active' ? 'success' : 'warning'}
                    className="mt-0.5"
                  >
                    {subscription.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current period ends</p>
                  <p className="text-sm text-white">{formatDate(subscription.current_period_end)}</p>
                </div>
                {subscription.cancel_at_period_end && (
                  <Badge variant="warning">Cancels at period end</Badge>
                )}
              </>
            )}
            {!subscription && !error && (
              <p className="text-sm text-gray-400">You're on the {TIER_LABELS.free} plan.</p>
            )}
          </div>
        )}

        {subscription && subscription.status === 'active' && !subscription.cancel_at_period_end && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelMutation.mutate()}
              loading={cancelMutation.isPending}
              className="text-red-400 hover:text-red-300"
            >
              Cancel subscription
            </Button>
            {cancelMutation.isSuccess && (
              <p className="text-xs text-green-400 mt-1">
                Subscription will cancel at end of current period.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Error */}
      {apiError && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2" role="alert">
          {apiError}
        </p>
      )}

      {/* Plan comparison */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Plans</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(Object.entries(TIER_DATA) as [Tier, TierFeatures][]).map(([tier, data]) => (
            <TierCard
              key={tier}
              tier={tier}
              data={data}
              isCurrent={currentTier === tier}
              onUpgrade={() => {
                if (tier === 'free') {
                  cancelMutation.mutate();
                } else {
                  checkoutMutation.mutate(tier);
                }
              }}
              loading={checkoutMutation.isPending && checkoutMutation.variables === tier}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
