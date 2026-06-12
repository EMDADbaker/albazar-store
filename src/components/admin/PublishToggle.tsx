'use client';

import { useTransition } from 'react';
import { setDropPublished } from '@/app/admin/actions';

export default function PublishToggle({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => start(() => setDropPublished(id, !published))}
      className={`font-mono text-[9px] uppercase tracking-wide px-2.5 py-1 border transition-colors disabled:opacity-50 ${
        published
          ? 'border-accent/40 text-accent bg-accent/10'
          : 'border-ink/15 text-ink/40 hover:text-ink hover:border-ink/30'
      }`}
    >
      {pending ? '…' : published ? 'Published' : 'Draft'}
    </button>
  );
}
