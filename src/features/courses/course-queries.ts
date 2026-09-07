import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { courses } from '@/db/schema';

export async function getCourseBySlug(courseSlug: string) {
  const [courseRecord] = await db.select().from(courses).where(eq(courses.slug, courseSlug));
  return courseRecord ?? null;
}

export async function getCourseById(courseId: string) {
  const [courseRecord] = await db.select().from(courses).where(eq(courses.id, courseId));
  return courseRecord ?? null;
}

export async function listPublishedCourses() {
  return db.select().from(courses).where(eq(courses.status, 'published'));
}

export async function listCoursesByOwner(ownerId: string) {
  return db.select().from(courses).where(eq(courses.ownerId, ownerId));
}
