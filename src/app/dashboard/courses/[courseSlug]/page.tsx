import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourseBySlug } from '@/features/courses/course-queries';
import { CourseDetailContent } from '@/features/courses/course-detail-content';
import { Badge } from '@/components/ui/badge';

export default async function DashboardCourseDetailPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const courseRecord = await getCourseBySlug(courseSlug);
  if (!courseRecord) notFound();

  return (
    <main className="py-8">
      <div className="mx-auto max-w-5xl px-4">
        <Link href="/dashboard/courses" className="text-xs font-semibold uppercase tracking-wide text-navy-800 hover:underline">
          &larr; Browse courses
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-navy-900">{courseRecord.title}</h1>
          <Badge>{courseRecord.status}</Badge>
        </div>
        {courseRecord.summary && <p className="mt-1 text-sm text-slate-500">{courseRecord.summary}</p>}
      </div>

      <div className="mt-8">
        <CourseDetailContent courseSlug={courseSlug} basePath="/dashboard/courses" />
      </div>
    </main>
  );
}
