'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { courses } from '@/db/schema';
import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import { requireAuthenticatedUserFromSession } from '@/features/auth/require-authenticated-user';
import { requireRole } from '@/features/auth/require-role';
import { requireCourseOwnership } from './require-course-ownership';
import { slugify } from '@/slugify';
import type { NewCourse } from './course-types';

type CreateCourseInput = Pick<NewCourse, 'slug' | 'title' | 'summary' | 'priceAmountMinor' | 'currency'>;
type UpdateCourseInput = Partial<Pick<NewCourse, 'title' | 'summary' | 'priceAmountMinor' | 'currency'>>;

export async function createCourse(input: CreateCourseInput) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();
  requireRole(authenticatedUser, ['instructor', 'admin']);

  const [createdCourse] = await db
    .insert(courses)
    .values({ ...input, slug: slugify(input.slug), ownerId: authenticatedUser.userId })
    .returning();
  if (!createdCourse) throw new ApiError(500, API_ERROR_CODE.INTERNAL_ERROR, 'Failed to create course.');
  return createdCourse;
}

export async function updateCourse(courseId: string, updates: UpdateCourseInput) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();
  await requireCourseOwnership(authenticatedUser, courseId);

  const [updatedCourse] = await db.update(courses).set(updates).where(eq(courses.id, courseId)).returning();
  return updatedCourse;
}

export async function publishCourse(courseId: string) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();
  await requireCourseOwnership(authenticatedUser, courseId);

  const [publishedCourse] = await db
    .update(courses)
    .set({ status: 'published', publishedAt: new Date() })
    .where(eq(courses.id, courseId))
    .returning();
  return publishedCourse;
}

export async function unpublishCourse(courseId: string) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();
  await requireCourseOwnership(authenticatedUser, courseId);

  const [unpublishedCourse] = await db
    .update(courses)
    .set({ status: 'draft' })
    .where(eq(courses.id, courseId))
    .returning();
  return unpublishedCourse;
}

export async function deleteCourse(courseId: string) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();
  await requireCourseOwnership(authenticatedUser, courseId);

  await db.delete(courses).where(eq(courses.id, courseId));
}
