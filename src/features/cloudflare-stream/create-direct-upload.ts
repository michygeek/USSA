'use server';

import { db } from '@/db/client';
import { lessons } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import { requireAuthenticatedUserFromSession } from '@/features/auth/require-authenticated-user';
import { requireCourseOwnership } from '@/features/courses/require-course-ownership';
import { getLessonById } from '@/features/lessons/lesson-queries';
import { getModuleById } from '@/features/modules/module-queries';
import { cloudflareStreamFetch } from './cloudflare-stream-client';

const MAX_LESSON_VIDEO_DURATION_SECONDS = 3600;

interface CloudflareStreamDirectUploadResponse {
  uploadURL: string;
  uid: string;
}

export async function createLessonDirectUpload(lessonId: string) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();

  const lessonRecord = await getLessonById(lessonId);
  if (!lessonRecord) throw new ApiError(404, API_ERROR_CODE.LESSON_NOT_FOUND, 'Lesson not found.');

  const moduleRecord = await getModuleById(lessonRecord.moduleId);
  if (!moduleRecord) throw new ApiError(404, API_ERROR_CODE.MODULE_NOT_FOUND, 'Module not found.');

  await requireCourseOwnership(authenticatedUser, moduleRecord.courseId);

  const directUpload = await cloudflareStreamFetch<CloudflareStreamDirectUploadResponse>('/direct_upload', {
    method: 'POST',
    body: JSON.stringify({
      maxDurationSeconds: MAX_LESSON_VIDEO_DURATION_SECONDS,
      requireSignedURLs: true,
    }),
  });

  await db
    .update(lessons)
    .set({ cloudflareStreamVideoId: directUpload.uid })
    .where(eq(lessons.id, lessonId));

  return {
    cloudflareStreamUploadUrl: directUpload.uploadURL,
    cloudflareStreamVideoId: directUpload.uid,
  };
}
