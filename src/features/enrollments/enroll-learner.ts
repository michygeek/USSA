'use server';

import { db } from '@/db/client';
import { enrollments } from '@/db/schema';
import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import { requireAuthenticatedUserFromSession } from '@/features/auth/require-authenticated-user';
import { getCourseBySlug } from '@/features/courses/course-queries';

export async function enrollInFreeCourse(courseSlug: string) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();

  const courseRecord = await getCourseBySlug(courseSlug);
  if (!courseRecord) throw new ApiError(404, API_ERROR_CODE.COURSE_NOT_FOUND, 'Course not found.');
  if (courseRecord.status !== 'published') {
    throw new ApiError(403, API_ERROR_CODE.COURSE_NOT_PUBLISHED, 'This course is not published yet.');
  }
  if (courseRecord.priceAmountMinor > 0) {
    throw new ApiError(402, API_ERROR_CODE.PAID_COURSE_REQUIRES_CHECKOUT, 'This course requires checkout.');
  }

  await db
    .insert(enrollments)
    .values({ userId: authenticatedUser.userId, courseId: courseRecord.id })
    .onConflictDoNothing();
}
