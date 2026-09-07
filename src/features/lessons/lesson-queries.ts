import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { lessons, modules } from '@/db/schema';

export async function listLessonsByModule(moduleId: string) {
  return db.select().from(lessons).where(eq(lessons.moduleId, moduleId)).orderBy(asc(lessons.position));
}

export async function getLessonById(lessonId: string) {
  const [lessonRecord] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
  return lessonRecord ?? null;
}

export async function getLessonBySlugInCourse(courseId: string, lessonSlug: string) {
  const [lessonRecord] = await db
    .select({ lesson: lessons })
    .from(lessons)
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .where(and(eq(modules.courseId, courseId), eq(lessons.slug, lessonSlug)));
  return lessonRecord?.lesson ?? null;
}
