'use server';

import { db } from '@/db/client';
import { lessonProgress } from '@/db/schema';
import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import { requireAuthenticatedUserFromSession } from '@/features/auth/require-authenticated-user';
import { requireLessonAccess } from '@/features/lessons/require-lesson-access';
import { getLessonById } from '@/features/lessons/lesson-queries';
import { getModuleById } from '@/features/modules/module-queries';

export async function markLessonDone(lessonId: string) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();

  const lessonRecord = await getLessonById(lessonId);
  if (!lessonRecord) throw new ApiError(404, API_ERROR_CODE.LESSON_NOT_FOUND, 'Lesson not found.');

  const moduleRecord = await getModuleById(lessonRecord.moduleId);
  if (!moduleRecord) throw new ApiError(404, API_ERROR_CODE.MODULE_NOT_FOUND, 'Module not found.');

  await requireLessonAccess(authenticatedUser, lessonRecord, moduleRecord.courseId);

  await db
    .insert(lessonProgress)
    .values({ userId: authenticatedUser.userId, lessonId, completedAt: new Date() })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { completedAt: new Date() },
    });
}
