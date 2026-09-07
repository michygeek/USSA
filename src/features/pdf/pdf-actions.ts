'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { lessons } from '@/db/schema';
import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import { requireAuthenticatedUserFromSession } from '@/features/auth/require-authenticated-user';
import { requireCourseOwnership } from '@/features/courses/require-course-ownership';
import { getLessonById } from '@/features/lessons/lesson-queries';
import { getModuleById } from '@/features/modules/module-queries';
import { buildLessonPdfStoragePath, createLessonPdfUploadUrl } from './pdf-storage-client';

export async function createLessonPdfUploadTarget(lessonId: string) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();

  const lessonRecord = await getLessonById(lessonId);
  if (!lessonRecord) throw new ApiError(404, API_ERROR_CODE.LESSON_NOT_FOUND, 'Lesson not found.');

  const moduleRecord = await getModuleById(lessonRecord.moduleId);
  if (!moduleRecord) throw new ApiError(404, API_ERROR_CODE.MODULE_NOT_FOUND, 'Module not found.');

  await requireCourseOwnership(authenticatedUser, moduleRecord.courseId);

  const storagePath = buildLessonPdfStoragePath(lessonId);
  const { signedUrl, token, path } = await createLessonPdfUploadUrl(storagePath);

  await db.update(lessons).set({ pdfStoragePath: storagePath }).where(eq(lessons.id, lessonId));

  return { signedUrl, token, path };
}
