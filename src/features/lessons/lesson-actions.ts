'use server';

import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { lessons } from '@/db/schema';
import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import { requireAuthenticatedUserFromSession } from '@/features/auth/require-authenticated-user';
import { requireCourseOwnership } from '@/features/courses/require-course-ownership';
import { getModuleById } from '@/features/modules/module-queries';
import { slugify } from '@/slugify';
import { getLessonById } from './lesson-queries';

const LESSON_POSITION_GAP = 10;

async function getCourseIdForModule(moduleId: string): Promise<string> {
  const moduleRecord = await getModuleById(moduleId);
  if (!moduleRecord) throw new ApiError(404, API_ERROR_CODE.MODULE_NOT_FOUND, 'Module not found.');
  return moduleRecord.courseId;
}

async function getNextLessonPosition(moduleId: string): Promise<number> {
  const [lastLesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.moduleId, moduleId))
    .orderBy(desc(lessons.position))
    .limit(1);
  return (lastLesson?.position ?? 0) + LESSON_POSITION_GAP;
}

type CreateLessonInput = { title: string; slug: string; isPreview: boolean; contentType: 'video' | 'pdf' };
type UpdateLessonInput = Partial<Pick<CreateLessonInput, 'title' | 'isPreview'>>;

export async function createLesson(moduleId: string, input: CreateLessonInput) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();
  const courseId = await getCourseIdForModule(moduleId);
  await requireCourseOwnership(authenticatedUser, courseId);

  const position = await getNextLessonPosition(moduleId);
  const [createdLesson] = await db
    .insert(lessons)
    .values({ ...input, slug: slugify(input.slug), moduleId, position })
    .returning();
  return createdLesson;
}

export async function updateLesson(lessonId: string, updates: UpdateLessonInput) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();

  const lessonRecord = await getLessonById(lessonId);
  if (!lessonRecord) throw new ApiError(404, API_ERROR_CODE.LESSON_NOT_FOUND, 'Lesson not found.');

  const courseId = await getCourseIdForModule(lessonRecord.moduleId);
  await requireCourseOwnership(authenticatedUser, courseId);

  const [updatedLesson] = await db.update(lessons).set(updates).where(eq(lessons.id, lessonId)).returning();
  return updatedLesson;
}
