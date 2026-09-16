import { PageBanner } from '@/components/layout/page-banner';
import { getCourseBySlug } from '@/features/courses/course-queries';
import { CourseDetailContent } from '@/features/courses/course-detail-content';
import { notFound } from 'next/navigation';

export default async function CourseDetailPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const courseRecord = await getCourseBySlug(courseSlug);
  if (!courseRecord) notFound();

  return (
    <>
      <PageBanner title={courseRecord.title} subtitle={courseRecord.summary ?? ''} />
      <section className="bg-slate-50 py-12">
        <CourseDetailContent courseSlug={courseSlug} basePath="/courses" />
      </section>
    </>
  );
}
