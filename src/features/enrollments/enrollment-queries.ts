import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { courses, enrollments } from '@/db/schema';
import type { Course } from '@/features/courses/course-types';
import type { Enrollment } from '@/db/schema/enrollments';

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

export async function listEnrollmentsByUser(userId: string): Promise<{ enrollment: Enrollment; course: Course }[]> {
  const rows = await db
    .select({ enrollment: enrollments, course: courses })
    .from(enrollments)
    .innerJoin(courses, eq(courses.id, enrollments.courseId))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.enrolledAt));
  return rows;
}
