import Link from 'next/link';
import { PageBanner } from '@/components/layout/page-banner';
import { listPublishedCourses } from '@/features/courses/course-queries';
import { CourseCard } from '@/features/courses/course-card';

export default async function CoursesPage() {
  const publishedCourses = await listPublishedCourses();

  return (
    <>
      <PageBanner
        title="Courses & Programs"
        subtitle="Browse published training programs across military, law enforcement, corrections, security, and safety."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          {publishedCourses.length === 0 ? (
            <p className="text-center text-sm text-slate-500">No courses are published yet — check back soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {publishedCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="block transition hover:-translate-y-0.5">
                  <CourseCard course={course} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
