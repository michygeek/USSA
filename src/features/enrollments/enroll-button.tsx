'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { enrollInFreeCourse } from './enroll-learner';

export function EnrollButton({ courseSlug }: { courseSlug: string }) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleEnroll() {
    setIsEnrolling(true);
    setErrorMessage(null);
    try {
      await enrollInFreeCourse(courseSlug);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to enroll. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  }

  return (
    <div>
      <Button variant="gold" className="w-full" onClick={handleEnroll} isLoading={isEnrolling}>
        Enroll for free
      </Button>
      {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}
