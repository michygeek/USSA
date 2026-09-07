import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthenticatedUserFromSession } from '@/features/auth/get-authenticated-user';
import { listCoursesByOwner } from '@/features/courses/course-queries';
import { CourseCard } from '@/features/courses/course-card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export default async function InstructorCoursesPage() {
  const authenticatedUser = await getAuthenticatedUserFromSession();
  if (!authenticatedUser) redirect('/sign-in');
  if (authenticatedUser.role !== 'instructor' && authenticatedUser.role !== 'admin') redirect('/sign-in');

  const courseList = await listCoursesByOwner(authenticatedUser.userId);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Welcome back, {authenticatedUser.displayName}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-wide text-navy-900">YOUR COURSES</h1>
        </div>
        <Link href="/instructor/courses/new">
          <Button variant="gold">+ New Course</Button>
        </Link>
      </div>

      {courseList.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold-400">
            <Icon name="bookOpen" className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-navy-900">No courses yet</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Create your first course to start adding modules, lessons, and video training content.
          </p>
          <Link href="/instructor/courses/new" className="mt-6">
            <Button variant="gold">+ New Course</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courseList.map((course) => (
            <Link key={course.id} href={`/instructor/courses/${course.slug}`}>
              <CourseCard course={course} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
