'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCourse } from './course-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Course } from './course-types';

function formatDollarPreview(priceInput: string, currency: string): string {
  const amount = Number.parseFloat(priceInput);
  if (!priceInput || Number.isNaN(amount) || amount <= 0) return 'This course will be free to enroll in.';
  return `Learners will be charged ${amount.toFixed(2)} ${currency || 'USD'} to enroll.`;
}

export function EditCourseForm({ course }: { course: Course }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(course.title);
  const [summary, setSummary] = useState(course.summary ?? '');
  const [priceInput, setPriceInput] = useState((course.priceAmountMinor / 100).toFixed(2));
  const [currency, setCurrency] = useState(course.currency);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const priceAmountMinor = Math.round((Number.parseFloat(priceInput) || 0) * 100);
      await updateCourse(course.id, { title, summary, priceAmountMinor, currency });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save changes.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isEditing) {
    return (
      <Button variant="outline" onClick={() => setIsEditing(true)}>
        Edit details
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Title</label>
        <Input value={title} onChange={(changeEvent) => setTitle(changeEvent.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Summary</label>
        <Input value={summary} onChange={(changeEvent) => setSummary(changeEvent.target.value)} />
      </div>
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Price</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 49.99"
            value={priceInput}
            onChange={(changeEvent) => setPriceInput(changeEvent.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Currency</label>
          <Input placeholder="USD" value={currency} onChange={(changeEvent) => setCurrency(changeEvent.target.value)} required />
        </div>
      </div>
      <p className="-mt-2 text-xs text-slate-500">{formatDollarPreview(priceInput, currency)} Enter 0 for a free course.</p>
      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          Save changes
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
    </form>
  );
}
