import { and, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { enrollments } from '@/db/schema';

export async function getEnrollmentStatus(userId: string, courseId: string) {
  const [enrollmentRecord] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
  return enrollmentRecord ?? null;
}

export async function isUserEnrolledInCourse(userId: string, courseId: string): Promise<boolean> {
  const enrollmentRecord = await getEnrollmentStatus(userId, courseId);
  return enrollmentRecord !== null;
}
