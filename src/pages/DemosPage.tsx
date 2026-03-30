import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { demosApi } from '../api/demos';
import { getErrorMessage } from '../api/client';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import type { DemoLoRA } from '../types';

const CATEGORIES = ['All', 'Creative Writing', 'Code', 'Roleplay', 'Assistant', 'Analysis', 'Other'];

function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5" role={readOnly ? 'img' : 'group'} aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          aria-label={readOnly ? undefined : `Rate ${n} star${n !== 1 ? 's' : ''}`}
          className={[
            'text-lg transition-colors',
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            (hover || value) >= n ? 'text-yellow-400' : 'text-gray-600',
          ].join(' ')}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function DemoCard({ demo, onSelect, onRate }: { demo: DemoLoRA; onSelect: () => void; onRate: () => void }) {
  return (
    <Card className="flex flex-col gap-3 hover:border-white/20 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-red-300 transition-colors">
            {demo.name}
          </h3>
          <Badge variant="info" className="mt-1">{demo.category}</Badge>
        </div>
        {demo.is_featured && (
          <Badge variant="purple">Featured</Badge>
        )}
      </div>

      <p className="text-sm text-gray-400 line-clamp-3">{demo.description}</p>

      <div className="flex flex-wrap gap-1 mt-auto">
        {demo.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-xs text-gray-500 bg-white/5 rounded-full px-2 py-0.5">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <StarRating value={Math.round(demo.rating)} readOnly />
          <span className="text-xs text-gray-500">({demo.rating_count})</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onRate} aria-label={`Rate ${demo.name}`}>
            Rate
          </Button>
          <Button variant="outline" size="sm" onClick={onSelect} aria-label={`Try ${demo.name}`}>
            Try it
          </Button>
        </div>
      </div>
    </Card>
  );
}

export const DemosPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [ratingModal, setRatingModal] = useState<DemoLoRA | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [rateError, setRateError] = useState('');

  const { data: demos, isLoading } = useQuery({
    queryKey: ['demos', category],
    queryFn: () =>
      demosApi
        .list({ category: category === 'All' ? undefined : category, limit: 50 })
        .then((r) => r.data),
  });

  const rateMutation = useMutation({
    mutationFn: ({ slug, rating, comment }: { slug: string; rating: number; comment?: string }) =>
      demosApi.rate(slug, { rating, comment }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['demos'] });
      setRatingModal(null);
      setRatingValue(0);
      setRatingComment('');
      setRateError('');
    },
    onError: (err) => setRateError(getErrorMessage(err)),
  });

  const filtered =
    demos?.filter((d) =>
      search
        ? d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.description.toLowerCase().includes(search.toLowerCase()) ||
          d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
        : true
    ) ?? [];

  const handleTry = (demo: DemoLoRA) => {
    navigate('/chat', { state: { adapter: demo.slug } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Demo Models</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Browse and try community-shared LoRA adapters.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search models…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search demo models"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={[
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                category === cat
                  ? 'bg-red-700 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10',
              ].join(' ')}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner label="Loading demos" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No models found.</p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Demo models"
        >
          {filtered.map((demo) => (
            <li key={demo.id}>
              <DemoCard
                demo={demo}
                onSelect={() => handleTry(demo)}
                onRate={() => {
                  setRatingModal(demo);
                  setRatingValue(Math.round(demo.rating));
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Rating Modal */}
      <Modal
        isOpen={!!ratingModal}
        onClose={() => setRatingModal(null)}
        title={`Rate "${ratingModal?.name}"`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRatingModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!ratingModal || ratingValue === 0) return;
                setRateError('');
                rateMutation.mutate({
                  slug: ratingModal.slug,
                  rating: ratingValue,
                  comment: ratingComment || undefined,
                });
              }}
              loading={rateMutation.isPending}
              disabled={ratingValue === 0}
            >
              Submit rating
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Your rating</p>
            <StarRating value={ratingValue} onChange={setRatingValue} />
          </div>
          <Input
            label="Comment (optional)"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            placeholder="What did you think?"
          />
          {rateError && (
            <p className="text-sm text-red-400" role="alert">{rateError}</p>
          )}
        </div>
      </Modal>
    </div>
  );
};
