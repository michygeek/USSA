import { and, eq, isNotNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { lessonProgress, lessons, modules } from '@/db/schema';

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
}

export async function getCourseModuleProgress(userId: string, courseId: string): Promise<CourseProgress> {
  const courseLessons = await db
    .select({ lessonId: lessons.id })
    .from(lessons)
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .where(eq(modules.courseId, courseId));

  if (courseLessons.length === 0) return { totalLessons: 0, completedLessons: 0 };

  const completedRows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .where(and(eq(lessonProgress.userId, userId), eq(modules.courseId, courseId), isNotNull(lessonProgress.completedAt)));

  return { totalLessons: courseLessons.length, completedLessons: completedRows.length };
}

export async function getCompletedLessonIds(userId: string, courseId: string): Promise<Set<string>> {
  const completedRows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .where(and(eq(lessonProgress.userId, userId), eq(modules.courseId, courseId), isNotNull(lessonProgress.completedAt)));

  return new Set(completedRows.map((row) => row.lessonId));
}
