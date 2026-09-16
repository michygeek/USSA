import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { enrollments, lessonProgress, lessons, modules } from '@/db/schema';
import { listCoursesByOwner } from '@/features/courses/course-queries';
import type { Course } from '@/features/courses/course-types';

export interface CourseAnalytics {
  course: Course;
  enrollmentCount: number;
  totalLessons: number;
  // Average % of the course's lessons completed, across its own enrolled students. 0 when
  // there are no lessons yet or no one is enrolled — not "0% completion", just no data.
  averageCompletionRate: number;
}

export async function listCourseAnalytics(instructorId: string): Promise<CourseAnalytics[]> {
  const instructorCourses = await listCoursesByOwner(instructorId);

  return Promise.all(
    instructorCourses.map(async (course) => {
      const [enrollmentRows, courseLessons] = await Promise.all([
        db.select({ userId: enrollments.userId }).from(enrollments).where(eq(enrollments.courseId, course.id)),
        db
          .select({ lessonId: lessons.id })
          .from(lessons)
          .innerJoin(modules, eq(modules.id, lessons.moduleId))
          .where(eq(modules.courseId, course.id)),
      ]);

      const enrollmentCount = enrollmentRows.length;
      const totalLessons = courseLessons.length;

      if (enrollmentCount === 0 || totalLessons === 0) {
        return { course, enrollmentCount, totalLessons, averageCompletionRate: 0 };
      }

      const completedRows = await db
        .select({ userId: lessonProgress.userId })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
        .innerJoin(modules, eq(modules.id, lessons.moduleId))
        .where(and(eq(modules.courseId, course.id), isNotNull(lessonProgress.completedAt)));

      // Only count completions from people actually enrolled — an owner/admin previewing a
      // lesson shouldn't skew a course's student completion rate.
      const enrolledUserIds = new Set(enrollmentRows.map((row) => row.userId));
      const completedInstanceCount = completedRows.filter((row) => enrolledUserIds.has(row.userId)).length;

      const averageCompletionRate = Math.round((completedInstanceCount / (enrollmentCount * totalLessons)) * 100);

      return { course, enrollmentCount, totalLessons, averageCompletionRate };
    }),
  );
}

export interface InstructorOverviewStats {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  totalUniqueStudents: number;
  averageCompletionRate: number;
}

// Takes the already-computed course analytics list instead of re-querying, so a page that
// needs both only pays for one pass over the instructor's courses.
export async function getInstructorOverviewStats(courseAnalyticsList: CourseAnalytics[]): Promise<InstructorOverviewStats> {
  const totalCourses = courseAnalyticsList.length;
  const publishedCourses = courseAnalyticsList.filter(({ course }) => course.status === 'published').length;
  const totalEnrollments = courseAnalyticsList.reduce((sum, { enrollmentCount }) => sum + enrollmentCount, 0);

  const courseIds = courseAnalyticsList.map(({ course }) => course.id);
  const uniqueStudentIds = new Set<string>();
  if (courseIds.length > 0) {
    const enrollmentRows = await db.select({ userId: enrollments.userId }).from(enrollments).where(inArray(enrollments.courseId, courseIds));
    for (const row of enrollmentRows) uniqueStudentIds.add(row.userId);
  }

  const ratedCourses = courseAnalyticsList.filter(({ enrollmentCount, totalLessons }) => enrollmentCount > 0 && totalLessons > 0);
  const averageCompletionRate =
    ratedCourses.length > 0
      ? Math.round(ratedCourses.reduce((sum, { averageCompletionRate }) => sum + averageCompletionRate, 0) / ratedCourses.length)
      : 0;

  return { totalCourses, publishedCourses, totalEnrollments, totalUniqueStudents: uniqueStudentIds.size, averageCompletionRate };
}
