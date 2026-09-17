import { and, eq, ilike } from 'drizzle-orm';
import { db } from '@/db/client';
import { courses } from '@/db/schema';
import type { CourseCategory } from './course-types';

export async function getCourseBySlug(courseSlug: string) {
  const [courseRecord] = await db.select().from(courses).where(eq(courses.slug, courseSlug));
  return courseRecord ?? null;
}

export async function getCourseById(courseId: string) {
  const [courseRecord] = await db.select().from(courses).where(eq(courses.id, courseId));
  return courseRecord ?? null;
}

export async function listPublishedCourses(searchQuery?: string, category?: CourseCategory) {
  const conditions = [eq(courses.status, 'published')];
  if (searchQuery) conditions.push(ilike(courses.title, `%${searchQuery}%`));
  if (category) conditions.push(eq(courses.category, category));
  return db.select().from(courses).where(and(...conditions));
}

export async function listCoursesByOwner(ownerId: string) {
  return db.select().from(courses).where(eq(courses.ownerId, ownerId));
}
