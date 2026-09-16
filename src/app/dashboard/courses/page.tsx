import Link from 'next/link';
import { listPublishedCourses } from '@/features/courses/course-queries';
import { CourseCard } from '@/features/courses/course-card';
import { DashboardSearchForm } from '@/features/dashboard/dashboard-search-form';

export default async function DashboardCoursesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: searchQuery } = await searchParams;
  const publishedCourses = await listPublishedCourses(searchQuery);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-wide text-navy-900">BROWSE COURSES</h1>
        <DashboardSearchForm />
      </div>

      {searchQuery && (
        <p className="mt-4 text-sm text-slate-500">
          {publishedCourses.length} result{publishedCourses.length === 1 ? '' : 's'} for &ldquo;{searchQuery}&rdquo;
        </p>
      )}

      {publishedCourses.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-500">
          {searchQuery ? 'No courses match your search.' : 'No courses are published yet — check back soon.'}
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publishedCourses.map((course) => (
            <Link key={course.id} href={`/dashboard/courses/${course.slug}`} className="block transition hover:-translate-y-0.5">
              <CourseCard course={course} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
