'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';

export function DashboardSearchForm({
  targetPath = '/dashboard/courses',
  placeholder = 'Search courses...',
}: {
  targetPath?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    router.push(query.trim() ? `${targetPath}?q=${encodeURIComponent(query.trim())}` : targetPath);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(changeEvent) => setQuery(changeEvent.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 focus:border-navy-800 focus:outline-none"
      />
    </form>
  );
}
