import { and, eq, isNotNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { courses, lessonProgress, lessons, modules } from '@/db/schema';

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  // The moment the course became 100% complete (the last lesson's completedAt), or null if
  // it isn't fully complete yet. Derived, not stored — there is no separate "course completed" row.
  completedAt: Date | null;
}

export async function getCourseModuleProgress(userId: string, courseId: string): Promise<CourseProgress> {
  const courseLessons = await db
    .select({ lessonId: lessons.id })
    .from(lessons)
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .where(eq(modules.courseId, courseId));

  if (courseLessons.length === 0) return { totalLessons: 0, completedLessons: 0, completedAt: null };

  const completedRows = await db
    .select({ lessonId: lessonProgress.lessonId, completedAt: lessonProgress.completedAt })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .where(and(eq(lessonProgress.userId, userId), eq(modules.courseId, courseId), isNotNull(lessonProgress.completedAt)));

  const isCourseComplete = completedRows.length === courseLessons.length;
  const completedAt = isCourseComplete
    ? completedRows.reduce<Date | null>((latest, row) => {
        if (!row.completedAt) return latest;
        return !latest || row.completedAt > latest ? row.completedAt : latest;
      }, null)
    : null;

  return { totalLessons: courseLessons.length, completedLessons: completedRows.length, completedAt };
}

export interface CompletedLessonActivity {
  lessonTitle: string;
  lessonSlug: string;
  courseTitle: string;
  courseSlug: string;
  completedAt: Date;
}

export async function listCompletedLessonsForUser(userId: string): Promise<CompletedLessonActivity[]> {
  const rows = await db
    .select({
      lessonTitle: lessons.title,
      lessonSlug: lessons.slug,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      completedAt: lessonProgress.completedAt,
    })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, modules.courseId))
    .where(and(eq(lessonProgress.userId, userId), isNotNull(lessonProgress.completedAt)));

  return rows
    .filter((row): row is typeof row & { completedAt: Date } => row.completedAt !== null)
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
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
