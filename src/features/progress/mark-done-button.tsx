'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { markLessonDone } from './lesson-progress-actions';

export function MarkDoneButton({ lessonId, isCompleted }: { lessonId: string; isCompleted: boolean }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await markLessonDone(lessonId);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-2 rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
        Completed
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="gold" onClick={handleClick} isLoading={isSubmitting}>
        Mark as done
      </Button>
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}
