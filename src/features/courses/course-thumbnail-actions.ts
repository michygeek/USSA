'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { courses } from '@/db/schema';
import { requireAuthenticatedUserFromSession } from '@/features/auth/require-authenticated-user';
import { requireCourseOwnership } from './require-course-ownership';
import {
  buildCourseThumbnailStoragePath,
  createCourseThumbnailUploadUrl,
  getCourseThumbnailPublicUrl,
} from './course-thumbnail-storage-client';

export async function createCourseThumbnailUploadTarget(courseId: string) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();
  await requireCourseOwnership(authenticatedUser, courseId);

  const storagePath = buildCourseThumbnailStoragePath(courseId);
  const { signedUrl, token, path } = await createCourseThumbnailUploadUrl(storagePath);

  // Cache-bust: the storage path never changes on replace, so a stable URL would keep serving a cached old image.
  const thumbnailUrl = `${getCourseThumbnailPublicUrl(storagePath)}?v=${Date.now()}`;
  await db.update(courses).set({ thumbnailUrl }).where(eq(courses.id, courseId));

  return { signedUrl, token, path };
}
