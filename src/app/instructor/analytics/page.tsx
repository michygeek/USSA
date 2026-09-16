import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthenticatedUserFromSession } from '@/features/auth/get-authenticated-user';
import { listCourseAnalytics, getInstructorOverviewStats } from '@/features/instructors/instructor-analytics-queries';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';

export default async function InstructorAnalyticsPage() {
  const authenticatedUser = await getAuthenticatedUserFromSession();
  if (!authenticatedUser) redirect('/sign-in');
  if (authenticatedUser.role !== 'instructor' && authenticatedUser.role !== 'admin') redirect('/sign-in');

  const courseAnalyticsList = await listCourseAnalytics(authenticatedUser.userId);
  const overview = await getInstructorOverviewStats(courseAnalyticsList);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-wide text-navy-900">STUDENT ANALYTICS</h1>
      <p className="mt-1 text-sm text-slate-500">Enrollment and completion data across every course you own.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Courses" value={overview.totalCourses} />
        <StatCard label="Published" value={overview.publishedCourses} />
        <StatCard label="Students" value={overview.totalUniqueStudents} />
        <StatCard label="Enrollments" value={overview.totalEnrollments} />
        <StatCard label="Avg. completion" value={`${overview.averageCompletionRate}%`} />
      </div>

      <h2 className="mt-10 text-lg font-bold text-slate-900">By course</h2>
      {courseAnalyticsList.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Create a course to start seeing analytics here.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {courseAnalyticsList.map(({ course, enrollmentCount, totalLessons, averageCompletionRate }) => (
            <Card key={course.id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/instructor/courses/${course.slug}`} className="font-semibold text-slate-900 hover:underline">
                      {course.title}
                    </Link>
                    <Badge>{course.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {totalLessons} lesson{totalLessons === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-lg font-bold text-navy-900">{enrollmentCount}</p>
                    <p className="text-xs text-slate-500">Enrolled</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-navy-900">{averageCompletionRate}%</p>
                    <p className="text-xs text-slate-500">Avg. completion</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
