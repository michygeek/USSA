import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import type { AuthenticatedUser } from '@/features/auth/auth-types';
import { getCourseById } from './course-queries';

export async function requireCourseOwnership(authenticatedUser: AuthenticatedUser, courseId: string): Promise<void> {
  if (authenticatedUser.role === 'admin') return;

  const courseRecord = await getCourseById(courseId);
  if (!courseRecord) {
    throw new ApiError(404, API_ERROR_CODE.COURSE_NOT_FOUND, 'Course not found.');
  }
  if (courseRecord.ownerId !== authenticatedUser.userId) {
    throw new ApiError(403, API_ERROR_CODE.COURSE_NOT_OWNED, 'You do not own this course.');
  }
}
