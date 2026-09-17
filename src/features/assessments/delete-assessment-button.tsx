'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deleteAssessment } from './assessment-actions';

export function DeleteAssessmentButton({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm('Delete this assessment and every question, choice, and student attempt? This cannot be undone.');
    if (!confirmed) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deleteAssessment(assessmentId);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete assessment.');
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
        Delete assessment
      </Button>
      {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}
